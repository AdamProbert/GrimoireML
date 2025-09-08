# Justfile

# Setup Python virtual environment and install dependencies for all python micro-services
setup-python:
	# Create venv if it doesn't exist
	if [ ! -d .venv ]; then python3 -m venv .venv; fi
	# Activate virtual environment
	source .venv/bin/activate
	# Install dependencies from all requirements.txt files
	for req in $(find . -type f -name requirements.txt); do \
		echo "Installing $req"; \
		pip install -r "$req"; \
	done

