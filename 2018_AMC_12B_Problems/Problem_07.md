# 2018 AMC 12B Problem 7

## Problem
What is the value of  $\log_37\cdot\log_59\cdot\log_711\cdot\log_913\cdots\log_{21}25\cdot\log_{23}27$?
$\textbf{(A) } 3 \qquad \textbf{(B) } 3\log_{7}23 \qquad \textbf{(C) } 6 \qquad \textbf{(D) } 9 \qquad \textbf{(E) } 10$
## Solution 1
From the Change of Base Formula, we have $\frac{\prod_{i=3}^{13} \log (2i+1)}{\prod_{i=1}^{11}\log (2i+1)} = \frac{\log 25 \cdot \log 27}{\log 3 \cdot \log 5} = \frac{(2\log 5)\cdot(3\log 3)}{\log 3 \cdot \log 5} = \boxed{\textbf{(C) } 6}.$
## Solution 2
Using the chain rule of logarithms $\log _{a}$ b $\cdot \log _{b}$ c = $\log _{a}$ c, we get

$$
\begin{align*} \log_37\cdot\log_59\cdot\log_711\cdot\log_913\cdots\log_{21}25\cdot\log_{23}27 &= (\log _{3} 7 \cdot \log _{7} 11 \cdots \log _{23} 27) \cdot (\log _{5} 9 \cdot \log _{9} 13 \cdots \log _{21} 25) \\ &= \log _{3} 27 \cdot \log _{5} 25 \\ &= 3 \cdot 2 \\ &= \boxed{\textbf{(C) } 6}. \end{align*}
$$

## Video Solution by OmegaLearn
https://youtu.be/RdIIEhsbZKw?t=605

*~pi_is_3.14*
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/FmBU-BT89H4

*~Education, the Study of Everything*
## See Also
