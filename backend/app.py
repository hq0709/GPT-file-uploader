from flask import Flask, request, make_response
from llama_index import GPTSimpleVectorIndex, download_loader
from werkzeug.utils import secure_filename
import os
import uuid
import threading
import time
import shutil
from flask_cors import CORS

os.environ['OPENAI_API_KEY'] = "your api key" # 修改为你的api key
root = os.path.dirname(__file__)
app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True # 开启debug模式


def delete_context(dirName):
    time.sleep(300)
    if os.path.exists(dirName):
        shutil.rmtree(dirName)
    else:
        print('Path does not exist')
        
    return 'completed'

@app.route("/")
def hello_world():
    # print (os.environ['OPENAI_API_KEY'])
    return "<p>The Flask API route for GPTContext</p>"

@app.route('/api/addFile', methods=['POST'])
def add_context():
    if request.method == 'POST':
        print ('reached---------------------------')          
        # 上传文件并且作为一个json文件储存到uploads文件夹下
        try:
            indexKey = str(uuid.uuid1())
            dirName = os.path.join('./uploads/', indexKey)
            os.makedirs(dirName)
            print ('this is the file length', request.form['fileLength'])
            for i in range(int(request.form['fileLength'])):
                currFileName = 'file'+str(i)
                print ('currFileName', currFileName)
                currFile = request.files[currFileName]
                filename = currFile.filename
                new_filename = os.path.join(dirName,secure_filename(filename))
                currFile.save(new_filename)  
            
            t = threading.Thread(target=delete_context, args=(dirName,))
            t.start()
            # 指定gpt读取文件的路径
            try:
                SimpleDirectoryReader = download_loader('SimpleDirectoryReader')
                loader = SimpleDirectoryReader(dirName, recursive=True)  
                documents = loader.load_data()
                index = GPTSimpleVectorIndex(documents)
                indexPath = os.path.join(dirName,'index.json')
                index.save_to_disk(indexPath)
                # response = index.query("What is his hobbies?")
                # return str(response)
                response = make_response(indexKey)
                response.status_code = 200
                return response
            
            except Exception as e:
                print (e)
                response = make_response('Could not build index')
                response.status_code = 500
                return response
            
        except Exception as e:
            print (e)
            response = make_response('Could not upload files')
            response.status_code = 500
            return response           

@app.route('/api/getResponse', methods=['POST'])
def get_response():
    if request.method == 'POST':

        indexKey = request.form['indexKey']
        prompt = request.form['prompt']
        
        print (indexKey)        
        print (prompt)
                    
        try:
            indexKey = request.form['indexKey']
            prompt = request.form['prompt']
            
            if len(indexKey) < 1:
                response = make_response('No index has been built yet for this prompt')
                response.status_code = 404
                return response
            
            indexPath = os.path.join('uploads',indexKey,'index.json')
            
            print (indexPath)
            
            if os.path.exists(indexPath):
                index = GPTSimpleVectorIndex.load_from_disk(indexPath)
                res = index.query(prompt)
                response = make_response(str(res))
                response.status_code = 200
                return response
            else:
                response = make_response('Index has expired for this prompt')
                response.status_code = 404
                return response    
        except Exception as e:
            print (e)
            response = make_response('Something went wrong')
            response.status_code = 500
            return response
            
            
        
# 删除所有的文件
@app.route('/api/deleteAllContext', methods=['DELETE'])
def deleteAllContext():
    if request.method == 'DELETE':
        try:
            path = './uploads'
            if os.path.exists(path):
                shutil.rmtree(path)
                response = make_response('Folder removed!')
                response.status_code = 200
                return response
        except Exception as e:
            print (e)
            response = make_response('Could not delete')
            response.status_code = 500
            return response
        
if __name__ == '__main__':
    app.run()
    
    
    