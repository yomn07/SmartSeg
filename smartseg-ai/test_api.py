# test_api.py
import requests
import json

print("="*50)
print("Testing SmartSeg AI API")
print("="*50)

# Test health endpoint
print("\n1. Testing /health endpoint...")
try:
    response = requests.get('http://localhost:5000/health')
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")
    print("   Make sure the Flask server is running!")

# Test models info
print("\n2. Testing /models/info endpoint...")
try:
    response = requests.get('http://localhost:5000/models/info')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "="*50)
print("To test segmentation, send a POST to /segment with:")
print('''
{
    "scan_id": 1,
    "t1_path": "path/to/T1.nii.gz",
    "t2_path": "path/to/T2.nii.gz",
    "flair_path": "path/to/FLAIR.nii.gz",
    "t1ce_path": "path/to/T1CE.nii.gz"
}
''')