# ATM Machine's back-end server in Python.

# Flask
from flask import Flask
from flask import request
import flask
from flask_cors import CORS
import json

import random

app = Flask("ATM")
CORS(app)

from db.pw import *
from scan import *

from datetime import datetime


def get_date():
    now = datetime.now()
    formatted_date = now.strftime("%d/%m/%Y %H:%M:%S")
    return formatted_date


def numerify(number):
    return "{:,.0f}".format(number)


@app.route("/", methods=["GET"])
def index():
    return {"status": True}


@app.route("/test", methods=["POST", "GET"])
def test():
    data = request.get_json(force=True)
    return {"status": True}


@app.route("/match", methods=["POST", "GET"])
def match():
    data = request.get_json(force=True)
    print(data)
    return True


@app.route("/qualitycheck", methods=["POST", "GET"])
def qualitycheck():
    data = request.get_json(force=True)
    print(data)
    fingerprints = data["fingerprints"]
    ret = quality_check(fingerprints)
    return {"status": ret, "error": "Poor fingerprint quality. Please try again."}


@app.route("/addFinger", methods=["POST", "GET"])
def addFinger():
    data = request.get_json(force=True)
    user = User.get_or_none(User.id == int(data["id"]))
    finger = data["finger"]
    if user is None:
        return {"status": False, "error": "User doesn't exist."}
    qcheck = quality_check(finger)
    if qcheck is False:
        return {"status": qcheck, "error": "Poor fingerprint quality. Please try again."}
    prints = user.fingerprint.split("<FINGERDATA_SEPARATOR>")
    for f in finger:
        prints.append(f)
    user.fingerprint = "<FINGERDATA_SEPARATOR>".join(prints)
    user.save()
    print("Added finger.")
    return {"status": True}


@app.route("/register", methods=["POST", "GET"])
def register():
    data = request.get_json(force=True)
    # id = User.select().count()

    id = random.randrange(100, 999)
    exist_user = User.get_or_none(User.id == id)
    while exist_user is not None:
        id = random.randrange(100, 999)
        exist_user = User.get_or_none(User.id == id)

    print(data)

    card_exist = Card.get_or_none(Card.id == int(data["account_no"]))
    if card_exist is not None:
        return {"status": False, "error": "Incorrect Card Details."}
    
    User.create(
        id=id,
        cnic=data["cnic"],
        name=data["name"],
        pin=data["pin"],
        balance=50000,
        contact=data["contact"],
        fingerprint="<FINGERDATA_SEPARATOR>".join(data["fingerprint"]),
    )


    Card.create(
        id=int(data["account_no"]),
        account=id,
        bank=data["bank_type"],
        expiry=data["expiry"],
    )
    return {"status": True, "id": int(id)}


# s


@app.route("/getAll", methods=["GET"])
def getAll():
    lst = [User.name, User.pin, User.id]
    dat = User.select(*lst)
    for d in dat:
        print(d.name, ", ", d.pin, ", ", d.id)
    return {"status": True}


@app.route("/loginBio", methods=["POST", "GET"])
def loginBio():
    data = request.get_json(force=True)
    # Checking for admin
    if data["id"] == "admin":
        return {"status": False, "error": "Admin accounts only accept PIN."}

    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Incorrect Credentials."}

    dat = match_fingerprints(
        data["finger"], user.fingerprint.split("<FINGERDATA_SEPARATOR>")
    )
    if dat[0] == True:
        return {"status": True}
    else:
        return {"status": False, "error": dat[1]}


@app.route("/login", methods=["POST", "GET"])
def login():
    data = request.get_json(force=True)
    # Checking for admin
    if data["id"] == "admin":
        if data["pin"] == "0000":
            return {"status": True}
        return {"status": False, "error": "Wrong Admin PIN."}

    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Incorrect Credentials."}
    print(user.pin)
    if user.pin == data["pin"]:
        return {"status": True}
    return {"status": False, "error": "Incorrect credentials."}


# ##########
# WITHDRAW
# ##########
@app.route("/withdraw", methods=["POST", "GET"])
def withdraw():
    data = request.get_json(force=True)
    user_query = User.select().where(User.id == int(data["id"]))
    if user_query.exists():
        user = User.get(User.id == int(data["id"]))
        if user.balance < int(data["amount"]):
            return {"status": False, "error": "Insufficient Balance."}
        user.balance = user.balance - int(data["amount"])
        user.save()
        Transaction.create(
            status="Withdraw",
            account=int(data["id"]),
            account2=0,
            date=get_date(),
            amount=int(data["amount"]),
        )
        return {"status": True, "balance": user.balance}
    else:
        return {"status": False, "error": "Invalid User."}


# ##########
# Transfer
# ##########
@app.route("/transfer", methods=["POST", "GET"])
def transfer():
    data = request.get_json(force=True)
    user1 = User.get_or_none(User.id == int(data["sender"]))
    user2 = User.get_or_none(User.id == int(data["recipient"]))
    print(user1.balance)
    if user2 is None or user1 is None:
        return {"status": False, "error": "Recipient doesn't exist."}
    if user1.balance < int(data["amount"]):
        return {"status": False, "error": "Insufficient Balance."}
    if user1.id is user2.id:
        return {"status": False, "error": "Cannot self-transfer."}
    user1.balance = user1.balance - int(data["amount"])
    user2.balance = user2.balance + int(data["amount"])
    user1.save()
    user2.save()
    Transaction.create(
        status="Transfer",
        account=int(data["sender"]),
        account2=int(data["recipient"]),
        date=get_date(),
        amount=int(data["amount"]),
    )
    return {"status": True, "balance": user1.balance}


# ##########
# Balance
# ##########
@app.route("/balance", methods=["POST", "GET"])
def balance():
    data = request.get_json(force=True)
    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Invaild account."}
    return {"status": True, "balance": user.balance}


# ##########
# Transactions
# ##########
@app.route("/transaction", methods=["POST", "GET"])
def transactions():
    data = request.get_json(force=True)
    transactions = Transaction.select().where(
        (Transaction.account == int(data["id"]))
        | (Transaction.account2 == int(data["id"]))
    )
    ret = []
    for t in transactions:
        ret.append(
            {
                "account": t.account,
                "account2": t.account2,
                "date": t.date,
                "status": t.status,
                "amount": t.amount,
            }
        )
    return {"status": True, "data": ret}


# ##########
# Change Pin
# ##########
@app.route("/changepin", methods=["POST", "GET"])
def changepin():
    data = request.get_json(force=True)
    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Invalid User."}
    print(user.pin)
    print(data["old"])
    if user.pin != data["old"]:
        return {"status": False, "error": "Incorrect PIN."}
    if user.pin == data["pin"]:
        return {"status": False, "error": "Enter a different PIN."}
    user.pin = data["pin"]
    user.save()
    return {"status": True}

# ##########
# Get User Details
# ##########
@app.route("/getUserDetails", methods=["POST", "GET"])
def getUserDetails():
    data = request.get_json(force=True)
    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Invalid User."}
    card = Card.get_or_none(Card.account == user.id)
    if card is None:
        return {"status": False, "error": "Invalid Card."}
    return {
        "status": True,
        "id": user.id,
        "name": user.name,
        "balance": f"PKR {numerify(user.balance)}",
        "contact": user.contact,
        "cnic": user.cnic,
        "card": {
            "id": card.id,
            "bank": card.bank,
            "expiry": card.expiry
        }

    }

## ADMIN STUFF ##
@app.route("/admin/usertables", methods=["GET"])
def usertables():
    users = User.select()
    data = []
    for user in users:
        data.append(
            {
                "ID": user.id,
                "Name": user.name,
                "Balance": f"PKR {numerify(user.balance)}",
                "Contact": user.contact,
                "CNIC": user.cnic,
            }
        )
    return {"status": True, "data": data}

@app.route("/admin/cardtables", methods=["GET"])
def cardtables():
    cards = Card.select()
    data = []
    for card in cards:
        # print(Card)
        data.append(
            {
                "Card Number": card.id,
                "Owner ID": card.account.id,
                "Owner Name": card.account.name,
                "Bank": card.bank,
                "Expiry Date": card.expiry,
            }
        )
    print(data)
    return {"status": True, "data": data}

@app.route("/admin/transactiontable", methods=["GET"])
def transactiontable():
    trs = Transaction.select()
    data = []
    for tr in trs:
        # recipient = (tr.account2 == 0) ? "N/A" : tr.account2;
        recipient = tr.account2
        if (recipient == 0):
            recipient = "N/A"
        data.append(
            {
                "Sender ID": tr.account,
                "Recipient ID": recipient,
                "Transaction Date": tr.date,
                "Transaction Type": tr.status,
                "Transaction Amount": f"PKR {numerify(tr.amount)}",
            }
        )
    print(data)
    return {"status": True, "data": data}


@app.route("/admin/_delete", methods=["POST", "GET"])
def _delete():
    data = request.get_json(force=True)
    id = data["id"]

    user = User.get_or_none(User.id == int(data["id"]))
    if user is None:
        return {"status": False, "error": "Invalid User."}

    card = Card.get_or_none(Card.account == int(data["id"]))
    if card is not None:
        card.delete_instance()

    user.delete_instance()
    return {"status": True}


@app.route("/admin/_money", methods=["POST", "GET"])
def _money():
    data = request.get_json(force=True)
    id = data["id"]
    amount = data["amount"]

    user = User.get_or_none(User.id == int(id))
    if user is None:
        return {"status": False}
    user.balance += int(amount)
    user.save()
    return {"status": True}


# Starting the server
if __name__ == "__main__":
    app.run(debug=True)
