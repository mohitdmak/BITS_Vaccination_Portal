# Importing module
import hmni

# Creating matcher object instance
matcher = hmni.Matcher(model='latin')


# Import system tools
import sys

# Taking args from bash script
BITS_NAME = str(sys.argv[1])

# NAME FROM JSON DATA IN QR CODE
PDF_NAME = str(sys.argv[2])


# FIND SIMILARITY
percentage = matcher.similarity('Alan', 'Al')


# Return TO NODE EVENT LOOP
print(percentage);
