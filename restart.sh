#!/bin/bash

process_name="entry_share_main.py"
process_id=$(ps aux | grep "$process_name" | grep -v "grep" | head -1 | awk '{print $2}')
kill -9 $process_id
mkdir -p log
nohup python -u ./bin/$process_name >> ./log/share_main.log 2>&1 &
