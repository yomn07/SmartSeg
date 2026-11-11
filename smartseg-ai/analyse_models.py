import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce warnings

import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

import tensorflow as tf
import numpy as np
import glob

print("TensorFlow:", tf.__version__)

# Find all models
model_files = glob.glob("models/*.h5")
print(f"\nFound {len(model_files)} models:\n")

for f in model_files:
    name = os.path.basename(f)
    print("="*60)
    print(f"Model: {name}")
    print("="*60)
    
    try:
        model = tf.keras.models.load_model(f, compile=False)
        
        # 1. Input shape
        print(f"\n📥 Input shape: {model.input_shape}")
        
        # 2. Output structure
        print(f"\n📤 Output structure:")
        if isinstance(model.output, list):
            print(f"   → {len(model.output)} outputs")
            for i, out in enumerate(model.output):
                print(f"      Output {i+1}: {out.shape} (name: {out.name})")
        else:
            print(f"   → 1 output: {model.output.shape}")
        
        # 3. Test inference with dummy data
        print(f"\n🧪 Testing inference...")
        dummy_input = np.random.randn(1, 240, 240, 4).astype(np.float32)
        result = model.predict(dummy_input, verbose=0)
        
        if isinstance(result, list):
            print(f"   → Got {len(result)} outputs")
            print(f"   → First output shape: {result[0].shape}")
            print(f"   → First output values range: [{result[0].min():.4f}, {result[0].max():.4f}]")
        else:
            print(f"   → Output shape: {result.shape}")
        
        # 4. Look for custom layers (CBAM)
        print(f"\n🔧 Custom layers:")
        custom_count = 0
        for layer in model.layers:
            if 'lambda' in layer.name.lower() or 'custom' in layer.__class__.__name__.lower():
                custom_count += 1
                print(f"   - {layer.name}: {layer.__class__.__name__}")
        
        if custom_count == 0:
            print("   No obvious custom layers found")
        
        print(f"\n📊 Total layers: {len(model.layers)}")
        
    except Exception as e:
        print(f"\n❌ Failed: {e}")

print("\n" + "="*60)
print("Done!")