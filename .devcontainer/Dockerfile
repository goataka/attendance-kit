# Build stage based on devcontainer image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install Git (required by devcontainer features and spec-kit)
RUN apt-get update && \
    apt-get install -y git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /workspace

# Set up environment variables for spec-kit
ENV PATH="${PATH}:/root/.local/bin"

# Install spec-kit CLI (matching devcontainer postCreateCommand)
RUN uv tool install specify-cli --from git+https://github.com/github/spec-kit.git && \
    echo '✓ spec-kit CLI installed'

# Copy project files
COPY . .

# Display environment info
RUN echo '🚀 Spec-Kit Development Container image built successfully!' && \
    echo "  ✓ Python $(python --version | cut -d' ' -f2)" && \
    echo "  ✓ uv $(uv --version | cut -d' ' -f2)" && \
    echo "  ✓ git $(git --version | cut -d' ' -f3)"

# Default command - keep container running for development
CMD ["/bin/bash", "-c", "echo 'Development environment is running' && tail -f /dev/null"]

