# 2021 AMC 12B Problem 10

## Problem
Two distinct numbers are selected from the set $\{1,2,3,4,\dots,36,37\}$ so that the sum of the remaining 35 numbers is the product of these two numbers. What is the difference of these two numbers?

$\textbf{(A) }5 \qquad \textbf{(B) }7 \qquad \textbf{(C) }8\qquad \textbf{(D) }9 \qquad \textbf{(E) }10$
## Solution
The sum of the first n integers is given by $\frac{n(n+1)}{2},$ so $\frac{37(37+1)}{2}=703.$

Therefore, 703-x-y=xy

Rearranging, xy+x+$y=703$. We can factor this equation by [SFFT](https://artofproblemsolving.com/wiki/index.php/SFFT) to get

$$(x+1)(y+1)=704$$

Looking at the possible divisors of 704 = $2^6\cdot11, 22$ and 32 are within the constraints of 0 < x $\leq$ y $\leq 37$ so we try those:

$$(x+1)(y+1) = 22\cdot32$$

$$x+1=22, y+1 = 32$$

$$x = 21, y = 31$$

Therefore, the difference $y-x=31-21=\boxed{\textbf{(E) }10}.$

*~SoySoy4444*

*~MathFun1000 ($\LaTeX$ help)*
## Video Solution (Just 2 min!)
https://youtu.be/QBRhWc8BT7U

_~Education, the Study of Everything_
## Video Solution by Punxsutawney Phil
https://YouTube.com/watch?v=yxt8-rUUosI&t=292s
## Video Solution by OmegaLearn (Simon's Favorite Factoring Trick)
https://youtu.be/v8MVGAZapKU

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## Video Solution by TheBeautyofMath
https://youtu.be/kuZXQYHycdk?t=1227

*~IceMatrix*
## See Also
