import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf

model = tf.keras.models.load_model('models/Aru-gd_model1CBAM.h5', compile=False)

print("\nLooking for layers that might be CBAM-related:")
print("="*50)

# Find layers that could be part of CBAM (channel attention, spatial attention)
cbam_patterns = ['channel', 'spatial', 'attention', 'multiply', 'reduce']

for i, layer in enumerate(model.layers):
    for pattern in cbam_patterns:
        if pattern in layer.name.lower():
            print(f"Layer {i}: {layer.name} -> {layer.__class__.__name__}")
            break

print(f"\nTotal layers: {len(model.layers)}")
print(f"Baseline model had 137 layers, this has {len(model.layers)}")
print(f"Difference: {len(model.layers) - 137} extra layers = CBAM!")