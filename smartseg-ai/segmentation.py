# segmentation.py
'''import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

import numpy as np
import tensorflow as tf
import nibabel as nib
from PIL import Image

class BrainTumorSegmenter:
    def __init__(self, model_paths):
        """Load all 3 models"""
        self.models = {}
        
        print("\n" + "="*50)
        print("Loading models...")
        print("="*50)
        
        for name, path in model_paths.items():
            print(f"\n📂 Loading {name} from {path}...")
            self.models[name] = tf.keras.models.load_model(path, compile=False)
            print(f"✅ {name} loaded!")
    
    def preprocess_slice(self, t1_path, t2_path, flair_path, t1ce_path, slice_idx=None):
        """
        Load and preprocess a single slice from 4 MRI modalities
        Returns: input_data of shape (1, 240, 240, 4), used_slice_index
        """
        # Load NIfTI files
        t1 = nib.load(t1_path).get_fdata()
        t2 = nib.load(t2_path).get_fdata()
        flair = nib.load(flair_path).get_fdata()
        t1ce = nib.load(t1ce_path).get_fdata()
        
        # Choose slice (middle slice if not specified)
        depth = t1.shape[2]
        if slice_idx is None:
            slice_idx = depth // 2
        
        # Extract slice
        t1_slice = t1[:, :, slice_idx]
        t2_slice = t2[:, :, slice_idx]
        flair_slice = flair[:, :, slice_idx]
        t1ce_slice = t1ce[:, :, slice_idx]
        
        # Z-score normalization (per slice, like your notebook)
        t1_slice = (t1_slice - np.mean(t1_slice)) / (np.std(t1_slice) + 1e-8)
        t2_slice = (t2_slice - np.mean(t2_slice)) / (np.std(t2_slice) + 1e-8)
        flair_slice = (flair_slice - np.mean(flair_slice)) / (np.std(flair_slice) + 1e-8)
        t1ce_slice = (t1ce_slice - np.mean(t1ce_slice)) / (np.std(t1ce_slice) + 1e-8)
        
        # Stack as 4 channels
        input_data = np.stack([t1_slice, t2_slice, flair_slice, t1ce_slice], axis=-1)
        
        # Add batch dimension
        input_data = np.expand_dims(input_data, axis=0).astype(np.float32)
        
        return input_data, slice_idx
    
    def segment_scan(self, t1_path, t2_path, flair_path, t1ce_path, slice_idx=None):
        """
        Run ensemble segmentation on MRI scan
        Returns: mask (240, 240), metrics (from your report), used_slice
        """
        print("\n" + "="*50)
        print("Running ensemble segmentation...")
        print("="*50)
        
        # Preprocess
        input_data, used_slice = self.preprocess_slice(
            t1_path, t2_path, flair_path, t1ce_path, slice_idx
        )
        print(f"Input shape: {input_data.shape}")
        print(f"Using slice index: {used_slice}")
        
        # Ensemble predictions
        predictions = []
        for name, model in self.models.items():
            print(f"\n  Running {name}...")
            preds = model.predict(input_data, verbose=0)
            
            # Model outputs 4 tensors, take first one (final output)
            if isinstance(preds, list):
                pred = preds[0]
                print(f"    → {len(preds)} outputs, using output 0")
            else:
                pred = preds
            
            predictions.append(pred)
        
        # Average predictions (ensemble)
        print("\n📊 Averaging predictions...")
        avg_pred = np.mean(predictions, axis=0)
        
        # Get final mask (argmax over classes)
        mask = np.argmax(avg_pred, axis=-1)[0]
        print(f"Mask shape: {mask.shape}")
        print(f"Unique classes: {np.unique(mask)}")
        
        # Convert classes back to original BraTS format (4 = enhancing tumor)
        # Your mask has classes 0,1,2,3. Convert 3 back to 4
        mask[mask == 3] = 4
        
        # Metrics from your report (Table 6.5)
        metrics = {
            'dscWT': 0.9141,
            'dscTC': 0.8632,
            'dscET': 0.7985,
            'iouWT': 0.8418,
            'iouTC': 0.7594,
            'iouET': 0.6646,
            'accuracy': (0.9141 + 0.8632 + 0.7985) / 3
        }
        
        return mask, metrics, used_slice
    
    def save_mask_as_image(self, mask, scan_id, output_dir='results'):
        """Save segmentation mask as PNG image"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Color mapping (matching your notebook)
        colors = {
            0: [0, 0, 0],      # Background - Black
            1: [255, 0, 0],    # Necrosis - Red
            2: [0, 255, 0],    # Edema - Green
            4: [255, 255, 0]   # Enhancing Tumor - Yellow
        }
        
        # Create RGB image
        h, w = mask.shape
        rgb_mask = np.zeros((h, w, 3), dtype=np.uint8)
        
        for class_id, color in colors.items():
            rgb_mask[mask == class_id] = color
        
        # Save as PNG
        output_path = f"{output_dir}/scan_{scan_id}_mask.png"
        Image.fromarray(rgb_mask).save(output_path)
        
        return output_path'''
# segmentation.py
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1' # Force CPU for stability

import numpy as np
import tensorflow as tf
import nibabel as nib
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
class BrainTumorSegmenter:
    def __init__(self, model_paths):
        self.models = {}
        print("\n" + "="*50)
        print("Initializing SmartSeg Ensemble...")
        for name, path in model_paths.items():
            print(f"📂 Loading {name}...")
            self.models[name] = tf.keras.models.load_model(path, compile=False)
        print("✅ All models loaded successfully.")

    '''def _normalize(self, slice_data):
        """Robust Z-score normalization for medical imaging"""
        mask = slice_data > 0 # Only normalize the actual brain, not background
        if np.any(mask):
            mean = np.mean(slice_data[mask])
            std = np.std(slice_data[mask])
            slice_data = (slice_data - mean) / (std + 1e-8)
        return slice_data'''
    def _normalize(self, slice_data):
        """Simple Z-score normalization - matches training preprocessing"""
        mean = np.mean(slice_data)
        std = np.std(slice_data)
        return (slice_data - mean) / (std + 1e-8)

    def preprocess_slice(self, t1_path, t2_path, flair_path, t1ce_path, slice_idx=None):
        # Load full volumes with nibabel
        t1    = nib.load(t1_path).get_fdata().astype(np.float32)
        t2    = nib.load(t2_path).get_fdata().astype(np.float32)
        flair = nib.load(flair_path).get_fdata().astype(np.float32)
        t1ce  = nib.load(t1ce_path).get_fdata().astype(np.float32)

    # ✅ Transpose to match sitk axis order used during training: [H, W, D] → [D, H, W]
        t1    = np.transpose(t1,    (2, 0, 1))
        t2    = np.transpose(t2,    (2, 0, 1))
        flair = np.transpose(flair, (2, 0, 1))
        t1ce  = np.transpose(t1ce,  (2, 0, 1))

        depth = t1.shape[0]
        if slice_idx is None:
        # Training used slices 50, 52, 54, ... 98 (25 slices)
        # Middle of that range = slice 74 ≈ good default
            slice_idx = 74

    # ✅ Normalize whole volume first (matches training)
        def norm_vol(v):
            return (v - v.mean()) / (v.std() + 1e-8)

        t1    = norm_vol(t1)
        t2    = norm_vol(t2)
        flair = norm_vol(flair)
        t1ce  = norm_vol(t1ce)

    # ✅ Correct channel order: FLAIR=0, T1=1, T1CE=2, T2=3 (matches Cell 43)
        input_data = np.stack([
            flair[slice_idx],   # channel 0
            t1[slice_idx],      # channel 1
            t1ce[slice_idx],    # channel 2
            t2[slice_idx]       # channel 3
        ], axis=-1)

        return np.expand_dims(input_data, axis=0).astype(np.float32), slice_idx

    """def segment_scan(self, t1_path, t2_path, flair_path, t1ce_path, slice_idx=None):
        input_data, used_slice = self.preprocess_slice(t1_path, t2_path, flair_path, t1ce_path, slice_idx)
        
        preds = []
        for name, model in self.models.items():
            p = model.predict(input_data, verbose=0)
            # Handle multi-output models (Guided Decoders)
            preds.append(p[0] if isinstance(p, list) else p)
        
        # Ensemble: Soft Voting (Averaging probabilities)
        avg_probs = np.mean(preds, axis=0)
        mask = np.argmax(avg_probs, axis=-1)[0]
        
        # Print diagnostic info to catch "Only Green" issues
        unique, counts = np.unique(mask, return_counts=True)
        print(f"📊 Class distribution: {dict(zip(unique, counts))}")
        
        # BraTS Label mapping (3 -> 4 for Enhancing Tumor)
        mask[mask == 3] = 4
        
        # Hardcoded metrics from your project report
        metrics = {'dscWT': 0.9141, 'dscTC': 0.8632, 'dscET': 0.7985}
        
        return mask, metrics, used_slice"""
    def segment_scan(self, t1_path, t2_path, flair_path, t1ce_path, slice_idx=None):
        input_data, used_slice = self.preprocess_slice(t1_path, t2_path, flair_path, t1ce_path, slice_idx)
    
        preds = []
        for name, model in self.models.items():
            p = model.predict(input_data, verbose=0)
        # ✅ Multi-output model: take the LAST output (main decoder, most refined)
            if isinstance(p, list):
                final_pred = p[-1]  # last head = main output
            else:
                final_pred = p
            preds.append(final_pred)
    
    # Ensemble: Soft Voting
        avg_probs = np.mean(preds, axis=0)  # shape: (1, 240, 240, 4)
        mask = np.argmax(avg_probs, axis=-1)[0]  # shape: (240, 240), values 0-3
    
        print(f"📊 Raw class distribution (before remap): {dict(zip(*np.unique(mask, return_counts=True)))}")
    
    # BraTS Label mapping: class 3 → 4 (Enhancing Tumor)
        mask[mask == 3] = 4
    
        print(f"📊 Final class distribution (after remap): {dict(zip(*np.unique(mask, return_counts=True)))}")
    
        metrics = {
            'dscWT': 0.9141, 'dscTC': 0.8632, 'dscET': 0.7985,
            'iouWT': 0.8418, 'iouTC': 0.7594, 'iouET': 0.6646
        }
    
        return mask, metrics, used_slice
    def save_mask_as_image(self, mask, scan_id, flair_path, slice_idx, output_dir='results'):
        #Saves 3 views: Original MRI | Raw Mask | Overlay
    
    
        os.makedirs(output_dir, exist_ok=True)

        # ── Color Map ──
        colors = {
            0: [0,   0,   0  ],   # Background - Black
            1: [255, 0,   0  ],   # Necrosis   - Red
            2: [0,   255, 0  ],   # Edema      - Green
            4: [255, 255, 0  ]    # Enhancing  - Yellow
        }

        h, w = mask.shape
        rgb_mask = np.zeros((h, w, 3), dtype=np.uint8)
        for c, color in colors.items():
            rgb_mask[mask == c] = color

        # ── Load FLAIR for background ──
            flair_vol = nib.load(flair_path).get_fdata().astype(np.float32)
            flair_slice = flair_vol[:, :, slice_idx]
            flair_norm = (flair_slice - flair_slice.min()) / (flair_slice.max() - flair_slice.min() + 1e-8)
            flair_rgb = np.stack([flair_norm]*3, axis=-1)  # grayscale → RGB

        # ── Build overlay (your friend's code) ──
            alpha = 0.45
            color_mask = np.zeros((h, w, 3), dtype=np.float32)
            color_mask[mask == 1] = [1.0, 0.0, 0.0]   # red    - necrosis
            color_mask[mask == 2] = [0.0, 0.9, 0.0]   # green  - edema
            color_mask[mask == 4] = [1.0, 1.0, 0.0]   # yellow - enhancing tumor

            tumor_region = mask != 0
            overlay = flair_rgb.copy()
            overlay[tumor_region] = (
                (1 - alpha) * flair_rgb[tumor_region] +
             alpha       * color_mask[tumor_region]
             )

             # ── Plot 3 views ──
            fig, axes = plt.subplots(1, 3, figsize=(15, 5))
            fig.patch.set_facecolor('#1a1a2e')

            titles = ['Original MRI (FLAIR)', 'AI Mask Only', 'Prediction Overlay']
            imgs   = [flair_rgb, rgb_mask, overlay]

            for ax, img, title in zip(axes, imgs, titles):
                ax.imshow(img, vmin=0, vmax=1) if img.dtype == np.float32 or img.max() <= 1.0 else ax.imshow(img)
                ax.set_title(title, color='white', fontsize=13, pad=8)
                ax.axis('off')
                ax.set_facecolor('#1a1a2e')

             # ── Legend ──
            legend_elements = [
            mpatches.Patch(color='red',    label='Necrosis (NCR)'),
            mpatches.Patch(color='green',  label='Edema (ED)'),
            mpatches.Patch(color='yellow', label='Enhancing Tumor (ET)'),
        ]
        fig.legend(
            handles=legend_elements,
            loc='lower center', ncol=3,
            fontsize=11,
            facecolor='#2a2a4e',
            labelcolor='white',
            framealpha=0.9,
            bbox_to_anchor=(0.5, -0.05)
        )
        fig.suptitle(f'SmartSeg - Scan {scan_id} - Slice {slice_idx}', 
                 color='white', fontsize=14, y=1.02)

        plt.tight_layout()

        # Save
        save_path = f"{output_dir}/scan_{scan_id}_overlay.png"
        plt.savefig(save_path, bbox_inches='tight', 
                facecolor='#1a1a2e', dpi=150)
        plt.close()

        # Also save raw mask
        Image.fromarray(rgb_mask).save(
            f"{output_dir}/scan_{scan_id}_mask.png")

        print(f"✅ Saved overlay: {save_path}")
        return save_path