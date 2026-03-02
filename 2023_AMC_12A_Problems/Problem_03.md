# 2023 AMC 12A Problem 3

> This problem is the same as [2023 AMC 10A #3](https://artofproblemsolving.com/wiki/index.php/2023_AMC_10A_Problems/Problem_3) and [2023 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2023_AMC_12A_Problems/Problem_3).
## Problem 3
How many positive perfect squares less than 2023 are divisible by 5?

$\textbf{(A) } 8 \qquad\textbf{(B) }9 \qquad\textbf{(C) }10 \qquad\textbf{(D) }11 \qquad\textbf{(E) } 12$
## Solution 1 (slightly refined)
Since $\left \lfloor{\sqrt{2023}}\right \rfloor = 44,$ there are $\left \lfloor{\frac{44}{5}}\right \rfloor = \boxed{\textbf{(A) 8}}$ perfect squares less than 2023 that are divisible by 5.
## Solution 2
Since 5 is square-free, each solution must be divisible by $5^2=25.$ We take $\left \lfloor{\frac{2023}{25}}\right \rfloor = 80$ and see that there are $\boxed{\textbf{(A) 8}}$ positive perfect squares no greater than 80.

*~jwseph*
## Solution 3
Since the perfect squares have to be divisible by 5, then we know it has to be 5 times some number squared (5 \ cdot $x)^{2}$. With this information, you can figure out every single product of 5 and another number squared to count how many perfect squares are divisible by 5 that are less than 2023. (EX: $5^{2} = $25, $10^{2} = $100, ... $40^{2} = 1600$) With this you get a max of $40^{2}$, or  $\left \lfloor{\frac{44}{5}}\right \rfloor = \boxed{\textbf{(A) 8}}$ solutions.

*~BlueShardow*
*~NOOK(Minor LaTeX edits)*
## Solution 4
The way of BlueShardow refined:

All it takes is to recall that 45 squared is 2025, and 45 is 5 x 9. So all the squares of 5 x 1, 5 x 2, 5 x 3 so on are divisible by 5. So the answer is 8. It can be done even if one does not remember that 45 squared is 2025, all it takes is intuition. One can easily see mentally that 5 x 8 that is 40 squared is 1600, and then one has to do just one more computation and see that 5 x 9 that is 45 squared exceeds 2023, so the answer is 8.

*~edit by RobinDaBank*

Note that you can find the square of any number that ends in 5 by taking the number 5 more than it and the number 5 less than it, multiplying those together, and adding 25. For example, to calculate the square of 45, you do 40 x 50 = 2000, and $2000 + 25 = 2025$.

And then you know that it goes up from 1 to 44, and the multiples of five are {5, 10..., 35, 40}, dividing each of them by 5, you get {1, 2..., 7, 8}, therefore, the answer is $\boxed{\textbf{(A) 8}}$

*~note by amadeus1011, edited by mihikamishra, then edited by ~NXC*
## Video Solution by Little Fermat
https://youtu.be/h2Pf2hvF1wE?si=3FSk6sTPCUg9J0U1&t=394
*~little-fermat*
## Video Solution by Math-X
https://youtu.be/GP-DYudh5qU?si=rwUloGNfN7tcoG-8&t=502
## Video Solution by Power Solve
https://youtu.be/YXIH3UbLqK8?si=aIYHWEU82uUu21fQ&t=165
## Video Solution by CosineMethod
https://www.youtube.com/watch?v=wNH6O8D-7dY
## Video Solution
https://youtu.be/w7RBPIatRNE

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Video Solution
https://youtu.be/Z3fmCkuHG3c

*~Education, the Study of Everything*
## Video Solution by Power Solve
https://www.youtube.com/watch?v=8huvzWTtgaU
## Video Solution by Pablo's Math
https://youtu.be/BNhRdnOu-jI
## See Also
