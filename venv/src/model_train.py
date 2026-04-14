import datetime
import os
import pandas as pd
import tensorflow as tf

from data_pretreatment import train_ds, val_ds, class_names, class_names, normalized_train_ds, normalized_val_ds
from models import BATCH_SIZE, IMG_HEIGHT, IMG_WIDTH, CHANNELS, EPOCHS, early_stopping

# Load a model 
from models import model

model.summary()

# Training 
time = datetime.datetime.now() # Time checkpoint
time = str(time).replace(" ", "_")

history = model.fit(
    normalized_train_ds,  
    validation_data= normalized_val_ds, 
    epochs= EPOCHS, 
    # steps_per_epoch = 10,
    callbacks=[early_stopping]
)

# Export history as csv
current_dir = os.getcwd()
data_dir = current_dir[:-9]+"/data/train/"
new_path=current_dir[:-4]+"/models/"+str(time)
os.makedirs(new_path)

df = pd.DataFrame({
    'epoch': range(1, len(history.history['accuracy']) + 1),
    'accuracy': history.history['accuracy'],
    'val_accuracy': history.history['val_accuracy'],
    'loss': history.history['loss'],
    'val_loss': history.history['val_loss']
})
df.to_csv(new_path+"/training_history.csv", index=False)

# save model 
model.save(new_path+"/model.keras")

# Convert the model.
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open(new_path+"/model.tflite", 'wb') as f:
  f.write(tflite_model) 
