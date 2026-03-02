# 2013 AMC 12A Problem 14

## Problem
The sequence

$$\log_{12}{162}, \log_{12}{x}, \log_{12}{y}, \log_{12}{z}, \log_{12}{1250}$$

is an arithmetic progression. What is x?

$\textbf{(A)} \ 125\sqrt{3} \qquad \textbf{(B)} \ 270 \qquad \textbf{(C)} \ 162\sqrt{5} \qquad \textbf{(D)} \ 434 \qquad \textbf{(E)} \ 225\sqrt{6}$
## Solution 1
Since the sequence is arithmetic,

$\log_{12}{162} + 4d = \log_{12}{1250},$ where d is the common difference.

Therefore,

$4d=\log_{12}{1250} - \log_{12}{162} = \log_{12}{(1250/162)},$ and

$$d = \frac{1}{4}(\log_{12}{(1250/162)}) = \log_{12}{(1250/162)^{1/4}}$$

Now that we found d, we just add it to the first term to find x:


$$\log_{12}{162} + \log_{12}{(1250/162)^{1/4}} = \log_{12}{((162)(1250/162)^{1/4})}$$


x = (162)(1250/$162)^{1/4}$ = (162)(625/$81)^{1/4}$ = (162)(5/3) = 270, which is $\boxed{B}$
## Solution 2
As the sequence $\log_{12}{162}, \log_{12}{x}, \log_{12}{y}, \log_{12}{z}, \log_{12}{1250}$ is an arithmetic progression, the sequence 162,x,y,z,1250 must be a geometric progression.

If we factor the two known terms we get $162=2\cdot 3^4$ and $1250=2\cdot 5^4,$ thus the quotient is obviously 5/3 and therefore $x=162\cdot(5/3) = 270.$
## Video Solution by OmegaLearn
https://youtu.be/RdIIEhsbZKw?t=944

*~pi_is_3.14*
## See also
