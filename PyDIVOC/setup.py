"""Module setup."""

from os import path
import runpy
from setuptools import setup, find_packages

PACKAGE_NAME = "PyDIVOC"
version_meta = runpy.run_path("./version.py".format(PACKAGE_NAME))
VERSION = version_meta["__version__"]

# read the contents of your README file
this_directory = path.abspath(path.dirname(__file__))
with open(path.join(this_directory, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


def parse_requirements(filename):
    """Load requirements from a pip requirements file."""
    lineiter = (line.strip() for line in open(filename))

    requirements_list = []

    for line in lineiter:
        if line and not line.startswith("#"):
            requirements_list.append(line)

    return requirements_list


if __name__ == "__main__":
    setup(
        name=PACKAGE_NAME,
        version=VERSION,
        description='Python library for decoding and verifying the COWIN Covid19 Credentials for India from DIVOC',
        author='George J Padayatti',
        author_email='george.padayatti@igrant.io',
        license='Apache Software License',
        long_description=long_description,
        long_description_content_type='text/markdown',
        packages=find_packages(),
        include_package_data=True,
        install_requires=parse_requirements("requirements.txt"),
        python_requires=">=3.6.3",
        package_data={"PyDIVOC": ["requirements.txt"]},
        keywords=['covid19', 'divoc', 'india', 'w3c credential'],
        url='https://github.com/decentralised-dataexchange/pydivoc',
        classifiers=[
            "Development Status :: 5 - Production/Stable",
            "Programming Language :: Python :: 3",
            "License :: OSI Approved :: Apache Software License",
            "Operating System :: OS Independent",
            "Topic :: Software Development :: Libraries :: Python Modules",
            "Topic :: COVID19",
            "Intended Audience :: Developers",
            "Intended Audience :: Information Technology",
        ],
    )
