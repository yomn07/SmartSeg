# test_brats2020.py
import requests
import json
import os
import glob

print("="*60)
print("Testing SmartSeg API with BraTS 2020 MRI")
print("="*60)

# ============================================
# UPDATE THIS PATH to your BraTS 2020 folder
# ============================================
BRATS_ROOT = r"C:/Users/DELL/BraTS2020_TrainingData/BraTS2020_TrainingData/MICCAI_BraTS2020_TrainingData"

# Or if you have a specific patient folder, set it directly:
# PATIENT_FOLDER = r"C:/Users/DELL/BraTS2020_TrainingData/BraTS2020_TrainingData/MICCAI_BraTS2020_TrainingData/BraTS20_Training_001"

# ============================================
# FIRST: Let's find available patients
# ============================================

print("\n1. Looking for BraTS 2020 patients...")

if os.path.exists(BRATS_ROOT):
    # Find all patient folders
    patient_folders = glob.glob(os.path.join(BRATS_ROOT, "BraTS20_Training_*"))
    print(f"   Found {len(patient_folders)} patients")
    
    if patient_folders:
        print("\n   First 5 patients:")
        for folder in patient_folders[:5]:
            print(f"     - {os.path.basename(folder)}")
        
        # Use the first patient for testing
        PATIENT_FOLDER = patient_folders[0]
        print(f"\n   Using: {os.path.basename(PATIENT_FOLDER)}")
    else:
        print("   No patients found! Please check the path.")
        print(f"   Current path: {BRATS_ROOT}")
        exit()
else:
    print(f"   Path not found: {BRATS_ROOT}")
    print("\n   Please update BRATS_ROOT with your actual BraTS 2020 location")
    print("   Example: C:/Users/DELL/BraTS2020_TrainingData/BraTS2020_TrainingData/MICCAI_BraTS2020_TrainingData")
    exit()

# ============================================
# Build file paths
# ============================================

patient_name = os.path.basename(PATIENT_FOLDER)

t1_path = os.path.join(PATIENT_FOLDER, f"{patient_name}_t1.nii")
t2_path = os.path.join(PATIENT_FOLDER, f"{patient_name}_t2.nii")
flair_path = os.path.join(PATIENT_FOLDER, f"{patient_name}_flair.nii")
t1ce_path = os.path.join(PATIENT_FOLDER, f"{patient_name}_t1ce.nii")

print("\n2. Checking files...")
for path, name in [(t1_path, "T1"), (t2_path, "T2"), (flair_path, "FLAIR"), (t1ce_path, "T1CE")]:
    exists = os.path.exists(path)
    print(f"   {name}: {'✅ Found' if exists else '❌ Not found'}")

# Check if all files exist
if not all([os.path.exists(p) for p in [t1_path, t2_path, flair_path, t1ce_path]]):
    print("\n❌ Some files are missing!")
    exit()

# ============================================
# Check API health
# ============================================

print("\n3. Checking API health...")
try:
    response = requests.get('http://localhost:5000/health', timeout=5)
    print(f"   API Status: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")
    print("   Make sure the Flask server is running!")
    exit()

# ============================================
# Send segmentation request
# ============================================

print("\n4. Sending segmentation request...")
print("   This may take 30-60 seconds on CPU...")

payload = {
    "scan_id": patient_name,  # Use patient name as ID
    "t1_path": t1_path,
    "t2_path": t2_path,
    "flair_path": flair_path,
    "t1ce_path": t1ce_path
}

try:
    response = requests.post('http://localhost:5000/segment', json=payload, timeout=120)
    print(f"\n   Response Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Segmentation completed!")
        print(f"   Patient: {result['scan_id']}")
        print(f"   Slice used: {result['slice_used']}")
        print(f"   Mask saved: {result['mask_path']}")
        print(f"\n   Metrics (from your report):")
        print(f"     DSC Whole Tumor: {result['metrics']['dscWT']}")
        print(f"     DSC Tumor Core: {result['metrics']['dscTC']}")
        print(f"     DSC Enhancing Tumor: {result['metrics']['dscET']}")
        
        # Get full path to mask
        mask_full_path = os.path.abspath(result['mask_path'])
        print(f"\n📁 Segmentation image saved at:")
        print(f"   {mask_full_path}")
        print(f"\n   Open this file to see the tumor segmentation!")
        
    else:
        print(f"   Error: {response.json()}")
        
except requests.exceptions.Timeout:
    print("   Timeout! Segmentation took too long.")
    print("   This might be normal on CPU. Try a smaller image or wait longer.")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "="*60)
print("Done!")