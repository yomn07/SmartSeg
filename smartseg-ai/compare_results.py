# compare_results.py
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os

print("="*60)
print("Comparing Model Output vs Ground Truth")
print("="*60)

# Paths (update if different)
model_mask = "results/scan_BraTS19_2013_10_1_mask.png"
ground_truth = "best_slice_segmentation.png"

# Check if files exist
if not os.path.exists(model_mask):
    print(f"\n❌ Model mask not found: {model_mask}")
    print("   Run test_my_patient.py first!")
    exit()

if not os.path.exists(ground_truth):
    print(f"\n❌ Ground truth not found: {ground_truth}")
    print("   Run visualize_patient.py first!")
    exit()

# Load images
model_img = mpimg.imread(model_mask)
gt_img = mpimg.imread(ground_truth)

# Display side by side
fig, axes = plt.subplots(1, 2, figsize=(14, 7))

axes[0].imshow(model_img)
axes[0].set_title("Model Prediction (Your AI)", fontsize=14)
axes[0].axis('off')

axes[1].imshow(gt_img)
axes[1].set_title("Ground Truth (Correct Answer)", fontsize=14)
axes[1].axis('off')

plt.tight_layout()
plt.savefig('comparison_result.png', dpi=150, bbox_inches='tight')
print("\n✅ Comparison saved to: comparison_result.png")

print("\n" + "="*60)
print("HOW TO INTERPRET THE RESULTS:")
print("="*60)
print("""
🟢 GOOD (Model working well):
   - Tumor appears in the SAME location
   - Colors (Red, Green, Yellow) are in SIMILAR areas
   - Overall shape LOOKS like the ground truth

🔴 BAD (Model not working):
   - Tumor in WRONG location
   - Random colored spots everywhere
   - All BLACK (no tumor detected)
   - Colors completely different from ground truth

📊 Your model's metrics (from report):
   - DSC Whole Tumor: 0.9141 (91.4%) → Excellent
   - DSC Tumor Core: 0.8632 (86.3%) → Very Good  
   - DSC Enhancing Tumor: 0.7985 (79.9%) → Good

These metrics are from your training, not from this specific patient.
For this patient, the visual comparison is most important.
""")

plt.show()