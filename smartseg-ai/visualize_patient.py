# visualize_patient.py
import nibabel as nib
import numpy as np
import matplotlib.pyplot as plt
import os

# Update this to your patient folder
PATIENT_FOLDER = r"C:\Users\DELL\Downloads\BraTS19_2013_10_1"
patient_name = "BraTS19_2013_10_1"

print("="*60)
print(f"Visualizing Patient: {patient_name}")
print("="*60)

# Find the files (handle both .nii and .nii.gz)
def find_file(folder, base_name, modality):
    for ext in ['.nii.gz', '.nii']:
        path = os.path.join(folder, f"{base_name}_{modality}{ext}")
        if os.path.exists(path):
            return path
    return None

# Load MRI modalities
t1_path = find_file(PATIENT_FOLDER, patient_name, "t1")
flair_path = find_file(PATIENT_FOLDER, patient_name, "flair")
seg_path = find_file(PATIENT_FOLDER, patient_name, "seg")

print("\nLoading files...")
t1_img = nib.load(t1_path)
t1_data = t1_img.get_fdata()
print(f"✅ T1 loaded: {t1_data.shape}")

flair_img = nib.load(flair_path)
flair_data = flair_img.get_fdata()
print(f"✅ FLAIR loaded: {flair_data.shape}")

seg_img = nib.load(seg_path)
seg_data = seg_img.get_fdata()
print(f"✅ Segmentation loaded: {seg_data.shape}")

# Check unique values in segmentation
unique_values = np.unique(seg_data)
print(f"\nUnique values in segmentation: {unique_values}")
print("Meaning:")
print("  0 = Background / No tumor")
print("  1 = Necrosis (NCR/NET)")
print("  2 = Edema (ED)")
print("  4 = Enhancing Tumor (ET)")

# Color mapping for segmentation
colors = {
    0: [0, 0, 0],      # Black - Background
    1: [255, 0, 0],    # Red - Necrosis
    2: [0, 255, 0],    # Green - Edema
    4: [255, 255, 0]   # Yellow - Enhancing Tumor
}

def create_rgb_mask(mask):
    """Convert segmentation mask to RGB image"""
    h, w = mask.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)
    for value, color in colors.items():
        rgb[mask == value] = color
    return rgb

# Find slices with tumor
depth = t1_data.shape[2]
print(f"\nTotal slices: {depth}")

tumor_slices = []
for i in range(depth):
    if np.any(seg_data[:, :, i] > 0):
        tumor_slices.append(i)

print(f"Slices with tumor: {len(tumor_slices)}")

if tumor_slices:
    tumor_counts = [np.sum(seg_data[:, :, i] > 0) for i in tumor_slices]
    best_slice = tumor_slices[np.argmax(tumor_counts)]
    print(f"Best slice (most tumor): {best_slice}")
else:
    best_slice = depth // 2
    print("No tumor found! Showing middle slice.")

# Create visualization - show 5 slices around the best slice
slices_to_show = [best_slice - 4, best_slice - 2, best_slice, best_slice + 2, best_slice + 4]
slices_to_show = [s for s in slices_to_show if 0 <= s < depth]

print(f"\nShowing {len(slices_to_show)} slices: {slices_to_show}")

# Create figure
fig, axes = plt.subplots(2, len(slices_to_show), figsize=(4*len(slices_to_show), 8))

# Handle case with only 1 subplot
if len(slices_to_show) == 1:
    axes = axes.reshape(2, 1)

for idx, slice_idx in enumerate(slices_to_show):
    # T1 image
    t1_slice = t1_data[:, :, slice_idx]
    t1_slice = (t1_slice - t1_slice.min()) / (t1_slice.max() - t1_slice.min() + 1e-8)
    
    # FLAIR image
    flair_slice = flair_data[:, :, slice_idx]
    flair_slice = (flair_slice - flair_slice.min()) / (flair_slice.max() - flair_slice.min() + 1e-8)
    
    # Ground truth segmentation
    seg_slice = seg_data[:, :, slice_idx]
    seg_rgb = create_rgb_mask(seg_slice)
    
    # Plot T1
    axes[0, idx].imshow(t1_slice, cmap='gray')
    axes[0, idx].set_title(f'T1 - Slice {slice_idx}')
    axes[0, idx].axis('off')
    
    # Plot FLAIR + Segmentation
    axes[1, idx].imshow(flair_slice, cmap='gray')
    axes[1, idx].imshow(seg_rgb, alpha=0.5)
    axes[1, idx].set_title(f'FLAIR + Ground Truth')
    axes[1, idx].axis('off')

plt.tight_layout()
plt.savefig('ground_truth_visualization.png', dpi=150, bbox_inches='tight')
print("\n✅ Saved visualization to: ground_truth_visualization.png")

# Also save a single high-quality image of the best slice
fig2, ax = plt.subplots(1, 2, figsize=(12, 6))

# FLAIR image
flair_best = flair_data[:, :, best_slice]
flair_best = (flair_best - flair_best.min()) / (flair_best.max() - flair_best.min() + 1e-8)
ax[0].imshow(flair_best, cmap='gray')
ax[0].set_title(f'FLAIR MRI - Slice {best_slice}')
ax[0].axis('off')

# Segmentation overlay
seg_best = seg_data[:, :, best_slice]
seg_rgb_best = create_rgb_mask(seg_best)
ax[1].imshow(flair_best, cmap='gray')
ax[1].imshow(seg_rgb_best, alpha=0.6)
ax[1].set_title(f'Ground Truth Segmentation Overlay')
ax[1].axis('off')

plt.tight_layout()
plt.savefig('best_slice_segmentation.png', dpi=150, bbox_inches='tight')
print("✅ Saved best slice to: best_slice_segmentation.png")

print("\n" + "="*60)
print("Open these images to see what the ground truth looks like:")
print("  - ground_truth_visualization.png")
print("  - best_slice_segmentation.png")
print("="*60)

# Show stats
print("\nTumor region statistics:")
total_voxels = np.prod(seg_data.shape)
tumor_voxels = np.sum(seg_data > 0)
necrosis_voxels = np.sum(seg_data == 1)
edema_voxels = np.sum(seg_data == 2)
et_voxels = np.sum(seg_data == 4)

print(f"  Total voxels: {total_voxels:,}")
print(f"  Tumor voxels: {tumor_voxels:,} ({100*tumor_voxels/total_voxels:.2f}%)")
print(f"    Necrosis: {necrosis_voxels:,}")
print(f"    Edema: {edema_voxels:,}")
print(f"    Enhancing Tumor: {et_voxels:,}")

print("\n" + "="*60)