# Use LLM via Ollama
### Pull using Modelfile
To create a custom LLM that uses gemma3:4b (due to constraints of local compute)
```
ollama create reflect-brain -f Modelfile
```
### Run LLM
```
ollama run reflect-brain
```
### Delete LLM
```
ollama rm reflect-brain
```
