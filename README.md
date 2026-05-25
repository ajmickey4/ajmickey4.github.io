# Local Development

To run this website locally on your computer:

1.  **Install Prerequisites**:
    *   Install [Ruby+Devkit](https://rubyinstaller.org/) (ensure you select the MSYS2 development toolchain option during installation).
    *   Open a terminal/PowerShell.
    *   Install Bundler: `gem install bundler`

2.  **Setup the Project**:
    *   Navigate to the project directory.
    *   Install dependencies:
        ```powershell
        bundle install
        ```
    *   Create executables (fix for Windows path issues):
        ```powershell
        bundle binstubs jekyll
        ```

3.  **Run the Server**:
    *   Start the local server:
        ```powershell
        ./bin/jekyll serve
        ```
    *   Open your browser to `http://127.0.0.1:4000`.

Note: If you encounter `bundler: command not found: jekyll`, rely on the `./bin/jekyll serve` command instead of `bundle exec jekyll serve`.
