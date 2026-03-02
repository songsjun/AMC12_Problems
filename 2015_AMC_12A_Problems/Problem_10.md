# 2015 AMC 12A Problem 10

## Problem
Integers x and y with x>y>0 satisfy x+y+xy=80. What is x?

$\textbf{(A)}\ 8 \qquad\textbf{(B)}\ 10 \qquad\textbf{(C)}\ 15 \qquad\textbf{(D)}\ 18 \qquad\textbf{(E)}\ 26$
## Solution 1
Use [SFFT](https://artofproblemsolving.com/wiki/index.php/SFFT) to get $(x+1)(y+1)=81$. The terms $(x+1)$ and $(y+1)$ must be factors of 81, which include 1, 3, 9, 27, 81. Because x > y, $x+1$ is equal to 27 or 81. But if $x+1=81$, then $y=0$ and so $x=\boxed{\textbf{(E)}\ 26}.$
## Solution 2
Plug in values of x and solve for y, noting x > y and that y is an integer.

$x = 8$:

$$8 + y + 8y = 80$$

$y = 8$ (Does not work because x > y)

$x = 10$:

$$10 + y + 10y = 80$$

$y = 70/11$ (Does not work because y is not an integer)

$x = 15$:

$$15 + y + 15y = 80$$

$y = 65/16$ (Does not work because y is not an integer)

$x = 18$:

$$18 + y + 18y = 80$$

$y = 62/19$ (Does not work because y is not an integer)

Thus $x = 26, \boxed{\textbf{(E)}\ 26}.$

*~Solution by CYB3RFLARE7408*
## Video Solution by OmegaLearn
https://youtu.be/ba6w1OhXqOQ?t=4512

*~pi_is_3.14*
## See Also
