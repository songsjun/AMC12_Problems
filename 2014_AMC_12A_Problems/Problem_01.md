# 2014 AMC 12A Problem 1

## Problem
What is $\cdot\left(\tfrac{1}{2}+\tfrac{1}{5}+\tfrac{1}{10}\right)^{-1}?$

$\textbf{(A)}\ 3 \qquad\textbf{(B)}\ 8\qquad\textbf{(C)}\ \frac{25}{2} \qquad\textbf{(D)}\ \frac{170}{3}\qquad\textbf{(E)}\ 170$
## Solution
We have

$$10\cdot\left(\frac{1}{2}+\frac{1}{5}+\frac{1}{10}\right)^{-1}$$


Making the denominators equal gives


$$\implies 10\cdot\left(\frac{5}{10}+\frac{2}{10}+\frac{1}{10}\right)^{-1}$$


$$\implies 10\cdot\left(\frac{5+2+1}{10}\right)^{-1}$$


$$\implies 10\cdot\left(\frac{8}{10}\right)^{-1}$$


$$\implies 10\cdot\left(\frac{4}{5}\right)^{-1}$$


$$\implies 10\cdot\frac{5}{4}$$


$$\implies \frac{50}{4}$$


Finally, simplifying gives


$$\implies \boxed{\textbf{(C)}\ \frac{25}{2}}$$
## Solution 2
We have


$$\left(\frac{1}{10}\right)^{-1}\cdot \left(\frac{1}{2} + \frac{1}{5} + \frac{1}{10}\right)^{-1}$$

By Distributive Property,


$$\left(\frac{1}{20}+\frac{1}{50}+\frac{1}{100}\right)^{-1}$$

Now, we want to find the least common multiple of $20, 50,$ and $100,$ so


$$\text{lcm}(20,50,100)=\text{lcm}(2^2 \cdot 5,2 \cdot 5^2,2^2 \cdot 5^2)=2^2 \cdot 5^2=100$$

Converting everything to a denominator of $100,$


$$\left(\frac{5}{100}+\frac{2}{100}+\frac{1}{100}\right)^{-1}=\left(\frac{8}{100}\right)^{-1}=\frac{100}{8}$$

Now, we use Euclidean Algorithm, to find if this fraction is reducible, so


$$\gcd(100,8)=\gcd(12,8)=\gcd(4,8)=\gcd(4,4)$$

Thus, both the numerator and denominator are divisible by $4,$ so


$$\frac{100}{8} \cdot \frac{4}{4}=\frac{100}{4} \cdot \frac{4}{8}=25 \cdot \frac{1}{2}=\boxed{\frac{25}{2}}$$


- kante314
## Video Solution (CREATIVE THINKING)
https://youtu.be/sbz01QUWY6A

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/QvkvhIMpXz8

*~savannahsolver*
## See Also
