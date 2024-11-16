import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def base64_to_image(base64_string):
    img_data = base64.b64decode(base64_string)
    img = Image.open(BytesIO(img_data))
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def quality_check(lst):
    # Initialize SIFT detector
    sift = cv2.SIFT_create()
    ret = True

    print(f"\t Checking Quality...")
    
    # print_quality = 0.08 * len(kp1)
    # if print_quality < 245:
    #     print(f"\t \t {bcolors.FAIL} {print_quality} / 245 {bcolors.ENDC}")
    #     return [False, "Poor fingerprint quality. Please try again."]
    # else:
    #     print(f"\t \t {bcolors.OKGREEN} {print_quality} / 250 {bcolors.ENDC}")

    # print(f"{quality} / 225 \t ({len(kp1)})")

    for fngr in lst:
        img1 = base64_to_image(fngr)
        kp1, des1 = sift.detectAndCompute(img1, None)
        quality = 0.08 * len(kp1)
        if quality < 225:
            print(f"\t \t {bcolors.FAIL} {quality} / 225 {bcolors.ENDC}")
            ret = False
        else:
            print(f"\t \t {bcolors.OKGREEN} {quality} / 225 {bcolors.ENDC}")

    return ret


def match_fingerprints(new_image_base64, template_images_base64):
    print("Initiating Fingerprint Scan ...")
    ret = [False, "Fingerprints do not match."]
    # Decode base64 strings to images
    img1 = base64_to_image(new_image_base64)

    # Initialize SIFT detector
    sift = cv2.SIFT_create()

    # Find keypoints and descriptors with SIFT for the new image
    kp1, des1 = sift.detectAndCompute(img1, None)

    # Initialize FLANN (Fast Library for Approximate Nearest Neighbors)
    FLANN_INDEX_KDTREE = 1
    index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
    search_params = dict(checks=50)  # or pass empty dictionary
    flann = cv2.FlannBasedMatcher(index_params, search_params)

    print(f"\t Checking Quality...")
    print_quality = 0.08 * len(kp1)
    if print_quality < 245:
        print(f"\t \t {bcolors.FAIL} {print_quality} / 245 {bcolors.ENDC}")
        return [False, "Poor fingerprint quality. Please try again."]
    else:
        print(f"\t \t {bcolors.OKGREEN} {print_quality} / 250 {bcolors.ENDC}")

    # Iterate through template images and compare with the new image
    for template_image_base64 in template_images_base64:
        if ret[0] == True:
            break
        img2 = base64_to_image(template_image_base64)
        kp2, des2 = sift.detectAndCompute(img2, None)

        # print(f"\t \t FP Quality: {0.08 * len(kp1)} / 250")

        # Use FLANN to find matches
        matches = flann.knnMatch(des1, des2, k=2)

        # Apply ratio test
        good_matches = []
        for m, n in matches:
            if m.distance < 0.8 * n.distance:
                good_matches.append(m)

        avg = ((0.08 * len(kp1)) + (0.06 * len(kp2))) / 2
        print(f"\t Checking Score ...")
        print(f"\t \t {len(good_matches)} / {avg}") # \t\t({0.08 * len(kp1)} & {0.06 * len(kp2)})
        # print(
        #     f"{len(good_matches)} / {avg} \t\t({0.08 * len(kp1)} & {0.06 * len(kp2)})"
        # )
        if len(good_matches) > avg:
            print(f"\t \t -> {bcolors.OKGREEN} Passed {bcolors.ENDC}")
            ret = [True]
        else:
            print(f"\t \t -> {bcolors.FAIL} Failed {bcolors.ENDC}")
    # Return the status
    return ret
