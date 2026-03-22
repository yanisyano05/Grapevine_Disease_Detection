import os
import numpy as np 
import matplotlib.pyplot as plt
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns

from load_model import *
from data_pretreat import * # src/ function

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
y_pred = model.predict(test_ds)
y_ = np.argmax(y_pred, axis=1)

y_test_raw = np.concatenate([y for x, y in test_ds], axis=0)

y_test_classes = y_test_raw

cm = confusion_matrix(y_test_classes, y_)

class_names = ['Black_Rot', 'ESCA', 'Healthy', 'Leaf_Blight']

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
plt.title('Matrice de Confusion')
plt.ylabel('Vraies étiquettes')
plt.xlabel('Prédictions')

plt.tight_layout()
plt.show()

