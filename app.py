from flask import Flask, request, render_template, redirect, url_for, session, make_response, \
    session, flash, send_from_directory

app = Flask(__name__)



@app.route("/", methods=['GET'])
def home():
    return redirect("/basic_model")

@app.route("/basic_model", methods=['GET'])
def basic_model():
    return render_template("basic_model/index.html")

@app.route("/gossip_model", methods=['GET'])
def gossip_model():
    return render_template("gossip_model/index.html")

@app.route("/majority_model", methods=['GET'])
def majority_model():
    return render_template("majority_model/index.html")

@app.route("/partisian_sorting", methods=['GET'])
def partisian_sorting():
    return render_template("partisian_sorting/index.html")



if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=80, debug=False)  # use me for prod
    app.run(host="127.0.0.1", port=5009, debug=True)