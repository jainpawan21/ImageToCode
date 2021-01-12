import { Controlled as CodeMirror } from "react-codemirror2";
import React, { Component } from "react";
import { outputChange, submitting } from "../../store/Actions/codeActions";
import { connect } from "react-redux";
import axios from "../../axios";
import classes from "./editor.module.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/dracula.css";
require("codemirror/mode/clike/clike");
require("codemirror/mode/python/python");

class Editor extends Component {
  state = {
    lang: "cpp17",
    mode: "clike",
    value: `#include <iostream>
using namespace std;

int main() {
    int x=10;
    cout<<x;
}
        `,
    file: "",
    imageURL: "",
  };
  submitHandler = () => {
    this.props.submitting();
    const x = {
      code: this.state.value,
      input: this.props.input,
      lang: this.state.lang,
    };
    axios
      .post("api/codeCompile", x)
      .then((response) => {
        // console.log(response.data);
        this.props.outputChange(response.data.output.output);
      })
      .catch((error) => {
        // console.log(error);
      });
  };
  modeToggleHandler = (mode) => {
    if (mode === "cpp17") {
      this.setState({ mode: "clike", lang: "cpp17" });
    } else if (mode === "java") {
      this.setState({ mode: "clike", lang: "java" });
    } else if (mode === "python") {
      this.setState({ mode: "python", lang: "python3" });
    }
  };
  handleImageUpload = () => {
    const formData = new FormData();
    formData.append("image", this.state.file);
    axios
      .post("api/imageUpload", formData)
      .then((res) => {
        console.log(res);
        this.setState({ imageURL: res.data.imageURL });
      })
      .catch((err) => console.log(err));
  };
  handleImageToText = () => {
    axios
      .post("/api/imageToText", {
        imageURL: this.state.imageURL,
      })
      .then((res) => {
        // console.log(res);
        this.setState({ value: res.data.text });
      })
      .catch((err) => {
        // console.log(err);
      });
  };
  DownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([this.state.value], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "myFile.cpp";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
  render() {
    return (
      <>
        <div className={classes.run}>
          <div className={classes.heading}>Source Code</div>
          <div>
            <button
              className={classes.submit}
              onClick={() => this.submitHandler()}
            >
              Run
            </button>
            <button
              className={classes.submit}
              onClick={() => this.DownloadFile()}
            >
              Save
            </button>
          </div>
          <div className={classes.toogle}>
            <div
              className={
                this.state.lang === "cpp17" ? classes.active : classes.normal
              }
              onClick={() => this.modeToggleHandler("cpp17")}
            >
              C++
            </div>
          </div>
        </div>
        <div className={classes.imageDiv}>
          <div className={classes.inputDiv}>
            <input
              className={classes.input}
              type="file"
              accept="image/x-png,image/jpg,image/jpeg"
              onChange={(e) => {
                this.setState({ file: e.target.files[0] });
              }}
            />
            <button
              className={classes.submit}
              onClick={() => this.handleImageUpload()}
              style={{ marginTop: "10px" }}
            >
              Upload
            </button>
          </div>

          <div className={classes.imageUploadDiv}>
            {this.state.imageURL !== "" ? (
              <img src={this.state.imageURL} className={classes.imagePreview} alt="uploaded-code"/>
            ) : (
              ""
            )}
            {this.state.imageURL !== "" ? (
              <button
                className={classes.submit}
                onClick={() => this.handleImageToText()}
                style={{ marginTop: "10px" }}
              >
                Convert
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <CodeMirror
          className={classes.code}
          value={this.state.value}
          onBeforeChange={(editor, data, value) => {
            this.setState({ value: value });
          }}
          options={{
            mode: this.state.mode,
            theme: "dracula",
            lineNumbers: true,
            indentUnit: 4,
            indentWithTabs: true,
          }}
          autoCursor={true}
          onChange={(editor, data, value) => {}}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    input: state.code.input,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    outputChange: (output) => dispatch(outputChange(output)),
    submitting: () => dispatch(submitting()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Editor);
