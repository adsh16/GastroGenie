# from transformers import AutoModelForCausalLM, AutoTokenizer

# model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

# inputs = tokenizer("What is DeepSeek AI?", return_tensors="pt").to("cuda")
# outputs = model.generate(**inputs, max_new_tokens=100)
# print(tokenizer.decode(outputs[0]))

"""
nah just use ollama
"""