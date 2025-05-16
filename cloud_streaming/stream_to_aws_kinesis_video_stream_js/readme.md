
This sample uses gstreamer and amazon c++ library to send streams to Amazon KVS

Here are some dependencies and compilation which needs to be done
This guide assumes you are on Ubuntu environment

#install gstreamer via apt get

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
sudo apt install -y libssl1.1 ca-certificates


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


export GST_PLUGIN_PATH=/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build/dependency/libkvscproducer/kvscproducer-src:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib:$LD_LIBRARY_PATH

echo 'export GST_PLUGIN_PATH=/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/build/dependency/libkvscproducer/kvscproducer-src:/home/dreamtcs/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib' >> ~/.bashrc
source ~/.bashrc




#verify if the kvs extension for gstreamer works
gst-inspect-1.0 kvssink

#testing if the commandline interface works

gst-launch-1.0 -v \
    videotestsrc is-live=true pattern=ball ! video/x-raw,width=1280,height=720,framerate=30/1 ! \
    x264enc tune=zerolatency bitrate=512 speed-preset=superfast ! h264parse ! \
    kvssink stream-name="TestStream" \
    aws-region="us-west-2" \
    aws-access-key="AKIAEXAMPLEKEY" \
    aws-secret-key="aSecretExampleKey12345" \
    storage-size=512



