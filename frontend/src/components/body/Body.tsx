import { useState, useRef, useEffect } from "react";
import DocumentSVG from "../../img/document.svg";
import RefreshImg from "../../img/RefreshSVG.svg";
import axios from "axios"; // 与后端API交互

export default function Body() {
  // 状态变量
  const [dragActive, setDragActive] = useState<boolean>(false); //文件拖拽
  const inputRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  const [files, setFiles] = useState<any>([]); // 存储上传的文件
  const [uploadError, setUploadError] = useState(""); // 上传文件错误信息
  const [userMessage, setUserMessage] = useState(""); // 用户输入的信息
  const [disableChat, setDisableChat] = useState(true); // 禁用和启用聊天框
  const [disableUpload, setDisableUpload] = useState(false); // 禁用和启用上传文件
  const [responseLoading, setResponseLoading] = useState(false); // AI是否正在加载
  const [chats, setChats] = useState<any[]>([]); // 存储聊天记录

  // 随消息发送移动窗口
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // 清除聊天记录
  function clearChat() {
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);
    setFiles([]);
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "AI",
        message: "File has been cleared",
      },
    ]);
  }

  function reset() {
    setChats([]);
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);
    setFiles([]);
    window.location.reload();
  }
  // 拖拽文件上传功能
  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Dropped!!!");
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log(e.dataTransfer.files);
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
    }
  }

  const handleChange = function (e: any) {
    e.preventDefault();
    console.log("File has been added");
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files);
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
    }
  };

  function removeFile(fileName: any, idx: any) {
    console.log("this is the old arr", files);
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }
  // 处理上传的文件
  function handleSubmitFile(e: any) {
    if (files.length === 0) {
      setUploadError("No file has been uploaded.");
      return;
    }
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "AI",
        message: "Reading your document...",
      },
    ]);
    setDisableUpload(true);

    let data = new FormData();
    data.append("fileLength", files.length);

    for (let i = 0; i < files.length; i++) {
      data.append("file" + i.toString(), files[i]);
    }

    console.log(data);
    // post请求到后端，如果更换服务器地址，应该对应修改这个网址
    axios
      .post("http://127.0.0.1:5000/api/addFile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log(res);
        localStorage.setItem("indexKey", res.data);
        setFiles([]);
        setDisableChat(false);
        // setTimeout(clearChat, 300000); // 5分钟删除上传的文件
        setChats((prevChats: any) => [
          ...prevChats,
          {
            sender: "AI",
            message:
              "File has been uploaded. Please ask your question!",
          },
        ]);
      })
      .catch((err) => {
        console.log(err);
        setDisableUpload(false);
        setChats((prevChats: any) => [
          ...prevChats,
          {
            sender: "AI",
            message:
              "Sorry something went wrong. Try again later or restart upload.",
          },
        ]);
      });
  }

  function handleSend() {
    if (localStorage.getItem("indexKey") === null) {
      setChats((prevChats: any) => [
        ...prevChats,
        {
          sender: "AI",
          message:
            "File is expired after 5 mins. Please upload new files.",
        },
      ]);
      return;
    }
    if (userMessage) {
      setChats((prevChats: any) => [
        ...prevChats,
        { sender: "user", message: userMessage },
      ]);
      setUserMessage("");
      setResponseLoading(true);
      let indexKey: any = localStorage.getItem("indexKey");
      let prompt = userMessage;
      let data = new FormData();
      data.append("prompt", prompt);
      data.append("indexKey", indexKey);
      console.log(data);
      // post请求到后端，如果更换服务器地址，应该对应修改这个网址
      axios
        .post("http://127.0.0.1:5000/api/getResponse", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setResponseLoading(false);
          setChats((prevState: any) => [
            ...prevState,
            { sender: "AI", message: res.data },
          ]);
          console.log(res);
          console.log(res.data);
        })
        .catch((err) => {
          setResponseLoading(false);

          setChats((prevState: any) => [
            ...prevState,
            {
              sender: "AI",
              message:
                "Sorry something went wrong. Try again later or restart.",
            },
          ]);
        });
    }
  }

  const onButtonClick = () => {
    inputRef.current.value = "";
    inputRef.current.click();
  };
  return (
    <div className="flex flex-col items-center h-screen">
      <form
        className={`border border-[#0c8ce9] p-3 md:w-[60%] lg:w-[60%] w-[100%] h-auto bg-[#eff5f9] mt-6 text-center rounded-lg ${
          dragActive ? "border-2" : ""
        }`}
        onDragEnter={handleDragEnter}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      >
        <input
          className="hidden"
          ref={inputRef}
          type="file"
          multiple={true}
          onChange={handleChange}
          accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
        />
        <label>
          <div className="flex justify-center items-center m-2">
            <img alt="documentSVG" src={DocumentSVG} className="h-10 w-10" />
          </div>
          <span className="text-[16px]">
            Drag & Drop or{" "}
            <span className="font-bold text-[#3038b0]" onClick={onButtonClick}>
              Choose file
            </span>{" "}
            <p className="text-[#c6392b]">(txt/doc/docx/pdf)</p>
            to upload
          </span>
        </label>
        <br></br>
        <button
          className={`${
            disableUpload ? "bg-[#bababa]" : "bg-black"
          } rounded-lg p-2 mt-3`}
          onClick={handleSubmitFile}
          disabled={disableUpload}
        >
          <span className="p-2 text-white">Submit</span>
        </button>
        {uploadError && <p>{uploadError}</p>}
        <div className="flex flex-col items-center">
          {files.map((file: any, idx: any) => (
            <div key={idx} className="flex flex-row space-x-5">
              <span>{file.name}</span>
              <span
                className="text-red-500"
                onClick={() => removeFile(file.name, idx)}
              >
                remove
              </span>
            </div>
          ))}
        </div>
      </form>
      <div className="flex flex-col md:w-[60%] lg:w-[60%] w-[100%]  h-[100vh]">
        <div className="rounded-lg mt-3 w-full h-full p-4 border border-[#ebebeb] flex flex-col justify-end overflow-y-auto">
          {chats.length > 0 ? (
            <div className="flex flex-col overflow-y-auto">
              <div className="flex flex-col space-y-4">
                {chats.map((chat: any, idx: any) => (
                  <div
                    key={idx}
                    ref={chatRef}
                    className={`${
                      chat.sender === "user"
                        ? "bg-[#2460ba] ml-auto"
                        : "bg-[#ebebeb] mr-auto"
                    } p-3 max-w-[70%] rounded-lg`}
                  >
                    <span
                      className={`${
                        chat.sender === "user" ? "text-white" : "text-black"
                      } break-all`}
                    >
                      {chat.message}
                    </span>
                  </div>
                ))}
              </div>
              {responseLoading && (
                <div className="text-center mt-3">
                  <span className="text-[#bababa]">Loading response...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-[10%]">
              <span className="text-[#bababa]">Please upload your file first.</span>
            </div>
          )}
        </div>

        <input
          className="w-full h-[10vh] mt-2 p-3 bg-[#f1f1f1] rounded-lg"
          placeholder="Ask me anything about your documents..."
          type="textarea"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => { // 增加了回车发送消息的功能
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}          
        ></input>
        <div className="flex flex-row mt-2 justify-between">
          <div className="flex flex-row space-x-4 items-center">
            <button onClick={reset}>
              <img alt="refresh-logo" src={RefreshImg} className="w-4 h-4" />
            </button>
            {
              /**
               * 当启用五分钟删除上传的文件的功能时，取消注释下面的代码
               */
            }
            {/* <span className="text-[#949494] italic text-[12px]">
              Session will expire 5 minutes after creation <br></br>
              This is to control any high demand / no. of requests.
            </span> */}
          </div>
          <button
            className={`${
              disableChat ? "bg-[#bababa]" : "bg-[#2460ba]"
            }  p-2 rounded-md h-10 w-28`}
            onClick={handleSend}
            disabled={disableChat}
          >
            <span className="text-white">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
