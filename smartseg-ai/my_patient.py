# test_my_patient.py
import requests
import json
import os

print("="*60)
print("Testing SmartSeg API with YOUR BraTS 2019 Patient")
print("="*60)

# ============================================
# YOUR PATIENT PATH
# ============================================
PATIENT_FOLDER = r"C:\Users\DELL\Downloads\BraTS19_2013_10_1"
patient_name = "BraTS19_2013_10_1"

print(f"\nPatient folder: {PATIENT_FOLDER}")

# ============================================
# Find the files (try both .nii and .nii.gz)
# ============================================

def find_file(folder, base_name, modality):
    """Find the file for a given modality"""
    # Try .nii.gz first, then .nii
    for ext in ['.nii.gz', '.nii']:
        path = os.path.join(folder, f"{base_name}_{modality}{ext}")
        if os.path.exists(path):
            return path
    return None

print("\n1. Looking for MRI files...")

t1_path = find_file(PATIENT_FOLDER, patient_name, "t1")
t2_path = find_file(PATIENT_FOLDER, patient_name, "t2")
flair_path = find_file(PATIENT_FOLDER, patient_name, "flair")
t1ce_path = find_file(PATIENT_FOLDER, patient_name, "t1ce")

files = {
    "T1": t1_path,
    "T2": t2_path,
    "FLAIR": flair_path,
    "T1CE": t1ce_path
}

all_found = True
for name, path in files.items():
    if path:
        size = os.path.getsize(path) / (1024 * 1024)  # MB
        print(f"   ✅ {name}: {os.path.basename(path)} ({size:.1f} MB)")
    else:
        print(f"   ❌ {name}: Not found")
        all_found = False

if not all_found:
    print("\n❌ Missing files! Please check the folder contents.")
    print("\nFiles in folder:")
    for f in os.listdir(PATIENT_FOLDER):
        print(f"   - {f}")
    exit()

# ============================================
# Check API health
# ============================================

print("\n2. Checking API health...")
try:
    response = requests.get('http://localhost:5000/health', timeout=10)
    print(f"   API Status: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")
    print("   Make sure the Flask server is running!")
    exit()

# ============================================
# Send segmentation request
# ============================================

print("\n3. Sending segmentation request...")
print("   This may take 30-60 seconds on CPU...")

payload = {
    "scan_id": patient_name,
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