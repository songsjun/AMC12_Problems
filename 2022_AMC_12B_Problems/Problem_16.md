# 2022 AMC 12B Problem 16

## Problem
Suppose x and y are positive real numbers such that
$x^y=2^{64}\text{ and }(\log_2{x})^{\log_2{y}}=2^{7}.$
What is the greatest possible value of $\log_2{y}$?

$\textbf{(A) }3 \qquad \textbf{(B) }4 \qquad \textbf{(C) }3+\sqrt{2} \qquad \textbf{(D) }4+\sqrt{3} \qquad \textbf{(E) }7$
## Solution 1
Take the base-two logarithm of both equations to get
y$\log_2x =64\quad\text{and}\quad (\log_2 y)(\log_2\log_2 x) = 7.$
Now taking the base-two logarithm of the first equation again yields
$$\log_2 y + \log_2\log_2 x = 6.$$
It follows that the real numbers r:=$\log_2$ y and s:=$\log_2\log_2$ x satisfy r+$s=6$ and rs = 7. Solving this system yields
$$\{\log_2 y,\log_2\log_2 x\}\in\{3-\sqrt 2, 3 + \sqrt 2\}.$$
Thus the largest possible value of $\log_2$ y is $3+\sqrt 2 \implies \boxed{\textbf{(C) }3+\sqrt{2}}.$

*~cr. djmathman*
## Solution 2
$$x^y=2^{64} \Rightarrow y\log_2{x}=64 \Rightarrow \log_2{x}=\dfrac{64}{y}.$$

Substitution into ($\log_2{x})^{\log_2{y}}=2^{7}$ yields


$$\left(\dfrac{64}{y}\right)^{\log_2{y}}=2^{7} \Rightarrow \log_2{y}\log_2{\dfrac{64}{y}}=7 \Rightarrow \log_2{y}(6-\log_2{y})=7 \Rightarrow \log^2_2{y}-6\log_2{y}+7=0.$$


Solving for $\log_2{y}$ yields $\log_2{y}=3-\sqrt{2}$ or $3+\sqrt{2},$ and we take the greater value $\boxed{\textbf{(C) }3+\sqrt{2}}.$

*~4SunnyH*
## Solution 3
Let $x = 2^a$, $y = 2^b$. We have ($2^a)^{2^b}=2^{64}\Rightarrow 2^{a\cdot 2^b} = 2^{64} \Rightarrowa\cdot 2^b = 64,$ and $a^b = 128$.

Then, from eq 1, $a =64\cdot 2^{-b},$ and substituting in to eq 2, ($64\cdot 2^{-b})^b = 64^b\cdot 2^{-b^2} = 2^{6b}\cdot 2^{-b^2} = 2^{6b-b^2} = 2^{7}.$ Thus, $6b-b^2 = 7.$

Solving for b using the quadratic formula gets $b = 3\pm \sqrt{2}.$ Since we are looking for $\log_2{y}$ which equals b, we put $\boxed{\textbf{(C) }3+\sqrt{2}}$ as our answer.

*~sirswagger21*
## Video Solution by mop 2024
https://youtu.be/ezGvZgBLe8k&t=722s

*~r00tsOfUnity*
## Video Solution (Just 2 min!)
https://youtu.be/WU15Q_b9EDI

_Education, the Study of Everything_
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## See Also
