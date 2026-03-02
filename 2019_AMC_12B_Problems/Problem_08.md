# 2019 AMC 12B Problem 8

## Problem
Let f(x) = $x^{2}(1-x)^{2}$. What is the value of the sum

$$f \left(\frac{1}{2019} \right)-f \left(\frac{2}{2019} \right)+f \left(\frac{3}{2019} \right)-f \left(\frac{4}{2019} \right)+\cdots + f \left(\frac{2017}{2019} \right) - f \left(\frac{2018}{2019} \right)?$$


$\textbf{(A) }0\qquad\textbf{(B) }\frac{1}{2019^{4}}\qquad\textbf{(C) }\frac{2018^{2}}{2019^{4}}\qquad\textbf{(D) }\frac{2020^{2}}{2019^{4}}\qquad\textbf{(E) }1$
## Solution
First, note that $f(x) = f(1-x).$ We can see this since

$$f(x) = x^2(1-x)^2 = (1-x)^2x^2 = (1-x)^{2}\left(1-\left(1-x\right)\right)^{2} = f(1-x)$$

Using this result, we regroup the terms accordingly:

$$
\left( f \left(\frac{1}{2019} \right) - f \left(\frac{2018}{2019} \right) \right) + \left( f \left(\frac{2}{2019} \right) - f \left(\frac{2017}{2019} \right) \right) + \cdots + \left( f \left(\frac{1009}{2019} \right) - f \left(\frac{1010}{2019} \right) \right)
= \left( f \left(\frac{1}{2019} \right) - f \left(\frac{1}{2019} \right) \right) + \left( f \left(\frac{2}{2019} \right) - f \left(\frac{2}{2019} \right) \right) + \cdots + \left( f \left(\frac{1009}{2019} \right) - f \left(\frac{1009}{2019} \right) \right)
$$

Now it is clear that all the terms will cancel out (the series telescopes), so the answer is $\boxed{\textbf{(A) }0}.$
## Video Solution
https://youtu.be/j_APcOIs_p4

*~Education, the Study of Everything*
## See Also
