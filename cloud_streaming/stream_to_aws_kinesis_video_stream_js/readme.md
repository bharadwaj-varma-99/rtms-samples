



This sample uses gstreamer and amazon c++ library to send streams to Amazon KVS

Here are some dependencies and compilation which needs to be done

#install gstreamer

sudo apt update
sudo apt install -y \
  git \
  cmake \
  build-essential \
  libssl-dev \
  libcurl4-openssl-dev \
  liblog4cplus-dev \
  libgstreamer1.0-dev \
  libgstreamer-plugins-base1.0-dev \
  gstreamer1.0-tools \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav

echo "deb http://security.ubuntu.com/ubuntu focal-security main" | sudo tee /etc/apt/sources.list.d/focal-security.list
sudo apt update
sudo apt install -y libssl1.1


#compile AWS KVS plugin for gstreamer



cd ~
git clone --recurse-submodules https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
cd amazon-kinesis-video-streams-producer-sdk-cpp
git submodule update --init --recursive


mkdir build
cd build

cmake .. -DBUILD_GSTREAMER_PLUGIN=TRUE -DCMAKE_VERBOSE_MAKEFILE=ON
make


#set library and path for AWS KVS plugin


export GST_PLUGIN_PATH=/home/username/amazon-kinesis-video-streams-producer-sdk-cpp/build
export LD_LIBRARY_PATH=/home/username/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib

echo 'export GST_PLUGIN_PATH=/home/username/amazon-kinesis-video-streams-producer-sdk-cpp/build' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/home/username/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib' >> ~/.bashrc
source ~/.bashrc


#verify if it works
gst-inspect-1.0 kvssink

#this runs on 


