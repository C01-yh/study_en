#!/bin/zsh
cd -- "$(dirname -- "$0")"
python3 launch.py
if [ $? -ne 0 ]; then
  printf '\n启动遇到问题，请查看上面的提示。按回车关闭。'
  read -r
fi
