# app.py
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

from segmentation import BrainTumorSegmenter

app = Flask(__name__)
CORS(app)  # Allow Spring Boot to call this API

# Model paths
MODEL_PATHS = {
    'baseline': 'models/Aru-gd_model14.h5',
    'cbam': 'models/Aru-gd_model1CBAM.h5',
    'cbam_focal': 'models/Aru-gd_model1CBAM+focalloss.h5'
}

# Global segmenter instance
segmenter = None

def initialize_models():
    """Load models"""
    global segmenter
    print("\n" + "="*60)
    print("Starting SmartSeg AI Service...")
    print("="*60)
    segmenter = BrainTumorSegmenter(MODEL_PATHS)
    print("\n✅ AI Service ready!")
    print("="*60)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Spring Boot"""
    if segmenter is None:
        return jsonify({'status': 'not_ready', 'message': 'Models not loaded'}), 503
    return jsonify({
        'status': 'ready',
        'models': list(segmenter.models.keys())
    })

@app.route('/segment', methods=['POST'])
def segment():
    """
    Segmentation endpoint
    Expects JSON:
    {
        "scan_id": 1,
        "t1_path": "uploads/scan_1_T1.nii.gz",
        "t2_path": "uploads/scan_1_T2.nii.gz",
        "flair_path": "uploads/scan_1_FLAIR.nii.gz",
        "t1ce_path": "uploads/scan_1_T1CE.nii.gz",
        "slice_idx": null (optional)
    }
    """
    if segmenter is None:
        return jsonify({'error': 'Models not loaded yet'}), 503
    
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        scan_id = data.get('scan_id')
        t1_path = data.get('t1_path')
        t2_path = data.get('t2_path')
        flair_path = data.get('flair_path')
        t1ce_path = data.get('t1ce_path')
        slice_idx = data.get('slice_idx')
        
        # Validate inputs
        if not all([scan_id, t1_path, t2_path, flair_path, t1ce_path]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if files exist
        for path in [t1_path, t2_path, flair_path, t1ce_path]:
            if not os.path.exists(path):
                return jsonify({'error': f'File not found: {path}'}), 404
        
        mask, metrics, used_slice = segmenter.segment_scan(
            t1_path, t2_path, flair_path, t1ce_path, slice_idx
        )
        
        # Save mask as image
        mask_path = segmenter.save_mask_as_image(mask, scan_id, flair_path, used_slice)
        
        # Return results
        response = {
            'status': 'success',
            'scan_id': scan_id,
            'slice_used': used_slice,
            'mask_path': mask_path,
            'metrics': metrics
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error during segmentation: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/models/info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    if segmenter is None:
        return jsonify({'status': 'not_ready'}), 503
    
    info = {}
    for name, model in segmenter.models.items():
        info[name] = {
            'input_shape': model.input_shape,
            'output_type': 'list' if isinstance(model.output, list) else 'single',
            'num_outputs': len(model.output) if isinstance(model.output, list) else 1,
            'layers': len(model.layers)
        }
    return jsonify(info)

if __name__ == '__main__':
    # Initialize models before starting server
    initialize_models()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)