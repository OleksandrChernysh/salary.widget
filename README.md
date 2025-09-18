# Project Installation Instructions

## Prerequisites

1. Ensure you have an account on [Toggl](https://toggl.com/).
2. Install `toggl-cli` by following the instructions in its official repository.

## Installation Steps

1. Clone the project repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables:

   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables:
     ```env
     TOGGL_API_KEY=<your-toggl-api-key>
     OTHER_ENV_VARIABLE=<value>
     ```
     Replace `<your-toggl-api-key>` with your Toggl API key and `<value>` with the appropriate values for other required environment variables.

4. Verify the installation:
   - Run the project or its test suite to ensure everything is set up correctly.

## Notes

- The project relies on `toggl-cli` for interacting with the Toggl API. Ensure it is properly installed and configured before running the project.
