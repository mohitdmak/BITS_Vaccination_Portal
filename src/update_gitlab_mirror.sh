#!/bin/sh

# This updates the mirror repo present @ gitlab.com/dvm-bitspilani for new commits on original repo @ github.com/mohitdmak/BITS_Vaccination_Portal

# Where scripts go to fail
die() {
    # echo error message to stderr by piping from stdout
  echo "FAIL"
  echo "$*" 1>&2
  exit 1
}

# Move to .git repo with same parent dir
cd ../${PWD##*/}.git || die "No Bare repository version found"

# fetch from origin remote and update gitlab mirror (require logged in creds)
git fetch origin || die "Github login required"
git push dvm_gitlab --all || die "Gitlab ssh key required in ssh-add"
