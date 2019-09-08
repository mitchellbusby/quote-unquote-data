import string
import random
import time
import math
import os

import torch.nn as nn
import sklearn.feature_extraction
import numpy
import torch
import torch.random


def char_tensor(string):
    tensor = torch.zeros(len(string)).long()
    for c in range(len(string)):
        try:
            tensor[c] = letters.index(string[c])
        except:
            continue
    return tensor

def _generate(decoder, prime_str='****', predict_len=100, temperature=0.8):
    hidden = decoder.init_hidden(1)
    prime_input = torch.autograd.Variable(char_tensor(prime_str).unsqueeze(0))

    predicted = prime_str

    # Use priming string to "build up" hidden state
    for p in range(len(prime_str) - 1):
        _, hidden = decoder(prime_input[:, p], hidden)

    inp = prime_input[:, -1]

    for p in range(predict_len):
        output, hidden = decoder(inp, hidden)

        # Sample from the network as a multinomial distribution
        output_dist = output.data.view(-1).div(temperature).exp()
        top_i = torch.multinomial(output_dist, 1)[0]

        # Add predicted character to string and use as next input
        predicted_char = letters[top_i]
        predicted += predicted_char
        inp = torch.autograd.Variable(char_tensor(predicted_char).unsqueeze(0))

    return predicted

class RNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, n_layers=1):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.n_layers = n_layers

        self.encoder = nn.Embedding(input_size, hidden_size)
        self.rnn = nn.LSTM(hidden_size, hidden_size, n_layers)
        self.decoder = nn.Linear(hidden_size, output_size)

    def forward(self, inp, hidden):
        batch_size = inp.size(0)
        encoded = self.encoder(inp)
        output, hidden = self.rnn(encoded.view(1, batch_size, -1), hidden)
        output = self.decoder(output.view(batch_size, -1))
        return output, hidden

    def forward2(self, inp, hidden):
        encoded = self.encoder(inp.view(1, -1))
        output, hidden = self.rnn(encoded.view(1, 1, -1), hidden)
        output = self.decoder(output.view(1, -1))
        return output, hidden

    def init_hidden(self, batch_size):
        return (torch.autograd.Variable(torch.zeros(self.n_layers, batch_size, self.hidden_size)),
                torch.autograd.Variable(torch.zeros(self.n_layers, batch_size, self.hidden_size)))


letters = sorted(string.ascii_uppercase + "'- *")

decoder = RNN(
    len(letters),
    16,
    len(letters),
    n_layers=3,
)
state_dict = torch.load(os.path.dirname(
    os.path.realpath(__file__)) + '/data/rnn.torch')
decoder.load_state_dict(state_dict)
decoder.eval()

def generate_name():
    name = _generate(decoder, '****', 100, temperature = 0.5).split('*')
    name = [n for n in name if n][0]
    return name + ' (Random)'
