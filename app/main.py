from flask import Flask, render_template

app = Flask(
    __name__,
    static_url_path='',
    static_folder='static/dist',
    template_folder='templates',
)

app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def index():
    # Hosts the main part of the application
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)