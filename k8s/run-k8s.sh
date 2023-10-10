#!/bin/bash

# Loop through all .yaml files in the current directory and apply them
for file in *.yml; do
    kubectl apply -f $file
    # Check if the command was successful
    if [ $? -ne 0 ]; then
        echo "Error applying $file! Exiting."
        exit 1
    fi
    echo "Applied $file successfully."
done

echo "All files applied successfully."
