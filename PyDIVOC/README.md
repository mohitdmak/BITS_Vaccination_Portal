# PyDIVOC

[![PyPI version](https://badge.fury.io/py/PyDIVOC.svg)](https://badge.fury.io/py/PyDIVOC) [![Total alerts](https://img.shields.io/lgtm/alerts/g/decentralised-dataexchange/PyDIVOC.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/decentralised-dataexchange/PyDIVOC/alerts/) [![Language grade: Python](https://img.shields.io/lgtm/grade/python/g/decentralised-dataexchange/PyDIVOC.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/decentralised-dataexchange/PyDIVOC/context:python)

## Introduction

Author: [George J Padayatti](mailto:george%40igrant.io)

Python library for decoding and verifying the [COWIN Covid19 Credentials for India](https://www.cowin.gov.in/) from [DIVOC](https://divoc.egov.org.in/)

## Pre requisites

This package have dependency to OpenCV and ZBAR (QR code library)


## Installation

Using a virtual environment is generally recommended:

```sh
$ python -m venv env
$ source env/bin/activate
```

Install with pip:

```sh
pip install PyDIVOC
```

## Usage

```python
from PyDIVOC.divoc_qr import decode_divoc_covid19_qr
w3c_vc = decode_divoc_covid19_qr("qr.png")
```

## TODO

- [ ] Function to verify JSON-LD signatures embedded in Covid19 Certificate
