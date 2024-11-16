from peewee import *

db = SqliteDatabase("database.db")

# ALL THE MODELS


# Base Model
class BaseModel(Model):
    class Meta:
        database = db


# Represents a User
class User(BaseModel):
    id = IntegerField(primary_key=True)
    pin = CharField()
    name = CharField()
    balance = IntegerField()
    contact = CharField()
    cnic = TextField()
    fingerprint = TextField()


# Represents the card details
class Card(BaseModel):
    id = IntegerField(primary_key=True)
    account = ForeignKeyField(User)
    bank = CharField()
    expiry = TextField()


# Represents a Transaction Request
class Transaction(BaseModel):
    account = IntegerField()
    account2 = IntegerField()
    date = TextField()
    status = TextField()
    amount = IntegerField()


db.connect()

# db.create_tables([User, Card, Transaction])
print("Connected to Database.")
