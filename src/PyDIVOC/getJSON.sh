#!/bin/bash

source virt/bin/activate || echo "no venv"

# python3 setup.py build

# pip3 install -r requirements.txt

python3 solve.py $directory 
