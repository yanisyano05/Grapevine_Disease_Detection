import matplotlib.pylab as plt
import numpy as np
import tensorflow as tf
import os
import math
from tensorflow.keras.models import load_model

from load_model import *
from data_pretreat import * # src/ function

model, model_dir = select_model()

def read_image(file_name):
    image = tf.io.read_file(file_name)
    image = tf.io.decode_jpeg(image, channels=channels)
    image = tf.image.convert_image_dtype(image, tf.float32)
    image = tf.image.resize_with_pad(image, target_height=img_height, target_width=img_width)
    return image

def top_k_predictions(img, k=2):
    image_batch = tf.expand_dims(img, 0)
    predictions = model(image_batch)
    probs = tf.nn.softmax(predictions, axis=-1)
    top_probs, top_idxs = tf.math.top_k(input=probs, k=k)
    
    top_labels = [class_names[idx.numpy()] for idx in top_idxs[0]]
    
    return top_labels, top_probs[0]

# Load img
img_name_tensors = {}

for images, labels in test_ds:  
    for i, class_name in enumerate(class_names):
        class_idx = class_names.index(class_name)
        mask = labels == class_idx
        
        if tf.reduce_any(mask):
            img_name_tensors[class_name] = images[mask][0] / 255.0


# Show img with prediction
plt.figure(figsize=(14, 12))
num_images = len(img_name_tensors)
cols = 2
rows = math.ceil(num_images / cols)

for n, (name, img_tensor) in enumerate(img_name_tensors.items()):
    ax = plt.subplot(rows, cols, n+1)
    ax.imshow(img_tensor)
    
    pred_labels, pred_probs = top_k_predictions(img_tensor, k=4)
    
    pred_text = f"Real classe: {name}\n\nPredictions:\n"
    for label, prob in zip(pred_labels, pred_probs):
        pred_text += f"{label}: {prob.numpy():0.1%}\n"

    ax.axis('off')
    ax.text(-0.5, 0.95, pred_text, ha='left', va='top', transform=ax.transAxes)

plt.tight_layout()
plt.show()

# Calculate Integrated Gradients
def f(x):
  return tf.where(x < 0.8, x, 0.8) #A simplified model function.

def interpolated_path(x):
  return tf.zeros_like(x) #A straight line path.

x = tf.linspace(start=0.0, stop=1.0, num=6)
y = f(x)

# Establish a baseline
baseline = tf.zeros(shape=(224,224,3))

m_steps=50
alphas = tf.linspace(start=0.0, stop=1.0, num=m_steps+1) # Generate m_steps intervals for integral_approximation() below.

def interpolate_images(baseline,
                       image,
                       alphas):
  alphas_x = alphas[:, tf.newaxis, tf.newaxis, tf.newaxis]
  baseline_x = tf.expand_dims(baseline, axis=0)
  input_x = tf.expand_dims(image, axis=0)
  delta = input_x - baseline_x
  images = baseline_x +  alphas_x * delta
  return images

def compute_gradients(images, target_class_idx):
  with tf.GradientTape() as tape:
    tape.watch(images)
    logits = model(images)
    probs = tf.nn.softmax(logits, axis=-1)[:, target_class_idx]
  return tape.gradient(probs, images)

def integral_approximation(gradients):
  # riemann_trapezoidal
  grads = (gradients[:-1] + gradients[1:]) / tf.constant(2.0)
  integrated_gradients = tf.math.reduce_mean(grads, axis=0)
  return integrated_gradients

# Putting it all together
def integrated_gradients(baseline,
                         image,
                         target_class_idx,
                         m_steps=50,
                         batch_size=32):
  # Generate alphas.
  alphas = tf.linspace(start=0.0, stop=1.0, num=m_steps+1)

  # Collect gradients.    
  gradient_batches = []

  # Iterate alphas range and batch computation for speed, memory efficiency, and scaling to larger m_steps.
  for alpha in tf.range(0, len(alphas), batch_size):
    from_ = alpha
    to = tf.minimum(from_ + batch_size, len(alphas))
    alpha_batch = alphas[from_:to]

    gradient_batch = one_batch(baseline, image, alpha_batch, target_class_idx)
    gradient_batches.append(gradient_batch)

  # Concatenate path gradients together row-wise into single tensor.
  total_gradients = tf.concat(gradient_batches, axis=0)

  # Integral approximation through averaging gradients.
  avg_gradients = integral_approximation(gradients=total_gradients)

  # Scale integrated gradients with respect to input.
  integrated_gradients = (image - baseline) * avg_gradients

  return integrated_gradients

@tf.function
def one_batch(baseline, image, alpha_batch, target_class_idx):
    # Generate interpolated inputs between baseline and input.
    interpolated_path_input_batch = interpolate_images(baseline=baseline,
                                                       image=image,
                                                       alphas=alpha_batch)

    # Compute gradients between model outputs and interpolated inputs.
    gradient_batch = compute_gradients(images=interpolated_path_input_batch,
                                       target_class_idx=target_class_idx)
    return gradient_batch

# Visualize attributions

def plot_img_attributions(baseline,
                          image,
                          target_class_idx,
                          m_steps=50,
                          cmap=None,
                          overlay_alpha=0.4):

  attributions = integrated_gradients(baseline=baseline,
                                      image=image,
                                      target_class_idx=target_class_idx,
                                      m_steps=m_steps)

  # Sum of the attributions across color channels for visualization.
  # The attribution mask shape is a grayscale image with height and width
  # equal to the original image.
  attribution_mask = tf.reduce_sum(tf.math.abs(attributions), axis=-1)

  fig, axs = plt.subplots(nrows=2, ncols=2, squeeze=False, figsize=(8, 8))

  axs[0, 0].set_title('Baseline image')
  axs[0, 0].imshow(baseline)
  axs[0, 0].axis('off')

  axs[0, 1].set_title('Original image')
  axs[0, 1].imshow(image)
  axs[0, 1].axis('off')

  axs[1, 0].set_title('Attribution mask')
  axs[1, 0].imshow(attribution_mask, cmap=cmap)
  axs[1, 0].axis('off')

  axs[1, 1].set_title('Overlay')
  axs[1, 1].imshow(attribution_mask, cmap=cmap)
  axs[1, 1].imshow(image, alpha=overlay_alpha)
  axs[1, 1].axis('off')

  plt.tight_layout()
  return fig

_ = plot_img_attributions(image=img_name_tensors['Leaf_Blight'],
                          baseline=baseline,
                          target_class_idx=3,
                          m_steps=240,
                          cmap=plt.cm.inferno,
                          overlay_alpha=0.4)
plt.show()


"""
@ref : 
https://www.tensorflow.org/tutorials/interpretability/integrated_gradients?hl=en
"""
