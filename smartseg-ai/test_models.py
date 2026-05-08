import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

import tensorflow as tf

print("TensorFlow version:", tf.__version__)

print("\n" + "="*50)
print("Testing model loading...")
print("="*50)

# YOUR ACTUAL FILE NAMES
model_paths = {
    'baseline (model14)': 'models/Aru-gd_model14.h5',
    'cbam': 'models/Aru-gd_model1CBAM.h5',
    'cbam_focal': 'models/Aru-gd_model1CBAM+focalloss.h5'
}

for name, path in model_paths.items():
    try:
        print(f"\n📂 Loading {name} from {path}...")
        model = tf.keras.models.load_model(path, compile=False)
        print(f"✅ {name} loaded successfully!")
        print(f"   📥 Input shape: {model.input_shape}")
        print(f"   📤 Output shape: {model.output_shape}")
        print(f"   🔢 Number of layers: {len(model.layers)}")
        
        # Check if model has CBAM layers
        has_cbam = any('cbam' in layer.name.lower() for layer in model.layers)
        print(f"   🔧 Contains CBAM: {'✅ Yes' if has_cbam else '❌ No'}")
        
    except Exception as e:
        print(f"❌ Failed to load {name}: {e}")
        
        # Check if it's a custom layer error
        if 'Unknown layer' in str(e):
            print("   ⚠️ This model uses custom layers (like CBAM)")
            print("   We'll need to define them from your notebook")

print("\n" + "="*50)
print("Done!")