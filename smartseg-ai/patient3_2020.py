import requests
import os
import nibabel as nib
import matplotlib.pyplot as plt
import numpy as np

# ============================================
# SETTINGS
# ============================================
BRATS_2020_PATH = r"C:/Users/DELL/BraTS2020_TrainingData/BraTS2020_TrainingData/MICCAI_BraTS2020_TrainingData"
PATIENT_ID = "BraTS20_Training_004"
PATIENT_FOLDER = os.path.join(BRATS_2020_PATH, PATIENT_ID)

# API Endpoint
URL = "http://localhost:5000/segment"

def run_test():
    # 1. Prepare Paths
    payload = {
        "scan_id": PATIENT_ID,
        "t1_path": os.path.join(PATIENT_FOLDER, f"{PATIENT_ID}_t1.nii"),
        "t2_path": os.path.join(PATIENT_FOLDER, f"{PATIENT_ID}_t2.nii"),
        "flair_path": os.path.join(PATIENT_FOLDER, f"{PATIENT_ID}_flair.nii"),
        "t1ce_path": os.path.join(PATIENT_FOLDER, f"{PATIENT_ID}_t1ce.nii"),
        "slice_idx": 70  # Explicitly picking a slice known to have tumor in 003
    }

    print(f"🚀 Sending Request for {PATIENT_ID}...")
    try:
        response = requests.post(URL, json=payload, timeout=120)
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Mask saved at: {result['mask_path']}")
            
            # 2. GENERATE OVERLAY IMMEDIATELY
            show_overlay(payload['flair_path'], result['mask_path'], 70)
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

def show_overlay(mri_path, mask_png_path, slice_idx):
    """Merges the result with the original brain scan"""
    from PIL import Image
    
    # Load original MRI slice
    mri_data = nib.load(mri_path).get_fdata()
    mri_slice = mri_data[:, :, slice_idx]
    
    # Load the PNG mask your API just created
    mask_img = Image.open(mask_png_path).convert("RGBA")
    mask_array = np.array(mask_img)
    
    # Display
    plt.figure(figsize=(10, 10))
    plt.imshow(mri_slice, cmap='gray')
    # Overlay the PNG with 50% transparency
    plt.imshow(mask_array, alpha=0.5) 
    plt.title(f"Patient 003 - Slice {slice_idx} - AI Overlay")
    plt.axis('off')
    plt.show()

if __name__ == "__main__":
    run_test()