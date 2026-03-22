from data_pretreat import *
import datetime
import os
import pandas as pd

# Create a model 
num_classes = len(class_names)

model = Sequential([
    data_augmentation,
    
    # Block 1
    layers.Conv2D(32, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.Conv2D(32, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=2),
    layers.Dropout(0.25),
    
    # Block 2
    layers.Conv2D(64, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.Conv2D(64, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=2),
    layers.Dropout(0.25),
    
    # Block 3
    layers.Conv2D(128, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.Conv2D(128, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=2),
    layers.Dropout(0.25),
    
    # Block 4
    layers.Conv2D(256, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.Conv2D(256, kernel_size=3, padding='same', activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D(pool_size=2),
    layers.Dropout(0.25),
    
    # Classification head
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(128, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(num_classes)
])

optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)

model.compile(optimizer=optimizer,
              loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=['accuracy'])

model.summary()

# Training 
time = datetime.datetime.now() # Time checkpoint
time = str(time).replace(" ", "_")

epochs=epochs
history = model.fit(
  normalized_ds,  
  validation_data= val_ds, 
  epochs= epochs #,steps_per_epoch= 10
)

# Export history as csv
new_path=current_dir[:-4]+"/models/"+str(time)
os.makedirs(new_path)

df = pd.DataFrame({
    'epoch': range(1, epochs+1),
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
