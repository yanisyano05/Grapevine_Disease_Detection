import os
import numpy as np 
import tensorflow as tf
import math
import matplotlib.pyplot as plt
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, classification_report
import seaborn as sns

from model_load import select_model
from data_pretreatment import test_ds, img_name_tensors, class_names

model, model_dir = select_model()

# Load datadframe 
df = pd.read_csv(model_dir+"/training_history.csv")

# Visualize training history
epochs_range = df.index
acc = df['accuracy']
val_acc = df['val_accuracy']
loss = df['loss']
val_loss = df['val_loss']

# Model testing 
y_ = model.predict(test_ds)
y_ = np.argmax(y_, axis=1)

y_test_classes = np.concatenate([y for x, y in test_ds], axis=0)

cm = confusion_matrix(y_test_classes, y_)

print("#"*10, class_names)
# Calcule de la précision
print("Precision per class: ", precision_score(y_test_classes, y_, average=None))

# Calcule du recall
print("Recall per class:", recall_score(y_test_classes, y_, average=None))

# Calcul de la F1-Score
print("F1-score : ", f1_score(y_test_classes, y_, average=None))

print("#"*10)

plt.figure(figsize=(16, 5))

# Subplot 1 : Training Accuracy
plt.subplot(1, 3, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')

# Subplot 2 : Training Loss
plt.subplot(1, 3, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')

# Subplot 3 : Confusion Matrix
plt.subplot(1, 3, 3)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=class_names, 
            yticklabels=class_names,
            cbar=False)
plt.title('Confusion Matrix')
plt.ylabel('True Classes')
plt.xlabel('Predictions')

plt.tight_layout()
plt.show()
 
# Display images probabilities 
def top_k_predictions(img, k=2):
    image_batch = tf.expand_dims(img, 0)
    predictions = model(image_batch)
    probs = tf.nn.softmax(predictions, axis=-1)
    top_probs, top_idxs = tf.math.top_k(input=probs, k=k)
    
    top_labels = [class_names[idx.numpy()] for idx in top_idxs[0]]
    
    return top_labels, top_probs[0]

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
