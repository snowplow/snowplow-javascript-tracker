#!/usr/bin/env bash
cd core
grunt
cd ..
grunt local
if [[ "$(uname)" == "Darwin" ]]; then
    (sleep 1 && open http:127.0.0.1:8000/integration.html)&
elif [[ "$(expr substr $(uname -s) 1 5)" == "Linux" ]]; then
    (sleep 1 && xdg-open http:127.0.0.1:8000/integration.html)&
elif [[ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]]; then
    :
elif [[ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]]; then
    :
fi
python3 ./tests/local/http-server.py
