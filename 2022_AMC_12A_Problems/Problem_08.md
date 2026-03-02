# 2022 AMC 12A Problem 8

## Problem
The infinite product

$$\sqrt[3]{10} \cdot \sqrt[3]{\sqrt[3]{10}} \cdot \sqrt[3]{\sqrt[3]{\sqrt[3]{10}}} \cdots$$

evaluates to a real number. What is that number?

$\textbf{(A) }\sqrt{10}\qquad\textbf{(B) }\sqrt[3]{100}\qquad\textbf{(C) }\sqrt[4]{1000}\qquad\textbf{(D) }10\qquad\textbf{(E) }10\sqrt[3]{10}$
## Solution 1
We can write $\sqrt$[3]{10} as $10 ^\frac{1}{3}.$ Similarly, $\sqrt$[3]{$\sqrt$[3]${10}} = (10 ^\frac{1}{3}) ^ \frac{1}{3} = 10 ^ \frac{1}{3^2}.$

By continuing this, we get the form
$$10 ^ \frac{1}{3} \cdot 10 ^ \frac{1}{3^2} \cdot 10 ^ \frac{1}{3^3} \cdots,$$
which is
$$10 ^ {\frac{1}{3} + \frac{1}{3^2} + \frac{1}{3^3} + \cdots}.$$
Using the formula for an infinite geometric series S = $\frac{a}{1-r},$ we get

$$\frac{1}{3} + \frac{1}{3^2} + \frac{1}{3^3} + \cdots = \frac{\frac{1}{3}}{1-\frac{1}{3}} = \frac{1}{2}.$$

Thus, our answer is $10 ^\frac{1}{2} = \boxed{\textbf{(A) }\sqrt{10}}.$

- phuang1024
## Solution 2
We can write this infinite product as L (we know from the answer choices that the product must converge):

$$L = \sqrt[3]{10} \cdot \sqrt[3]{\sqrt[3]{10}} \cdot \sqrt[3]{\sqrt[3]{\sqrt[3]{10}}} \cdots.$$

If we raise everything to the third power, we get:

$$L^3 = 10 \, \cdot \, \sqrt[3]{10} \, \cdot \, \sqrt[3]{\sqrt[3]{10}} \cdots = 10L \implies L^3 - 10L = 0 \implies L \in \left\{0, \pm \sqrt{10}\right\}.$$

Since L is positive (as it is an infinite product of positive numbers), it must be that L = $\boxed{\textbf{(A) }\sqrt{10}}.$

*~Oxymoronic15*
## Solution 3
Move the first term inside the second radical. We get

$$\sqrt[3]{10} \cdot \sqrt[3]{\sqrt[3]{10}} \cdot \sqrt[3]{\sqrt[3]{\sqrt[3]{10}}} \cdots = \sqrt[3]{10\sqrt[3]{10}} \cdot \sqrt[3]{\sqrt[3]{\sqrt[3]{10}}} \cdots.$$

Do this for the third radical as well:

$$\sqrt[3]{10\sqrt[3]{10}} \cdot \sqrt[3]{\sqrt[3]{\sqrt[3]{10}}} \cdots = \sqrt[3]{10\sqrt[3]{10}\sqrt[3]{\sqrt[3]{10}}} \cdots = \sqrt[3]{10\sqrt[3]{10\sqrt[3]{10\cdots}}}.$$

It is clear what the pattern is. Setting the answer as P, we have P = $\sqrt$[3]{10P}, from which P = $\boxed{\sqrt{10}}.$

*~kxiang*
## Solution 4
Set the product equal to P. We get
$\sqrt$[3]{10} $\cdot \sqrt$[3]{$\sqrt$[3]{10}} $\cdot \sqrt$[3]{$\sqrt$[3]{$\sqrt$[3]{10}}} $\cdots=P$ Since this is an infinite product, there may exist a clever manipulation where we set two different espressions involving P equal, from which we could solve for a number. Since all terms are raised to the $\frac{1}{3}$ power, we can cube both sides of our equation. We would get 10 $\cdot \sqrt$[3]{10} $\cdot \sqrt$[3]{$\sqrt$[3]{10}} $\cdot \sqrt$[3]{$\sqrt$[3]{$\sqrt$[3]{10}}} $\cdots=P^3$ From this, we know that $\frac{P^3}{10}=P,$ and to this equation, the only solution is P = $\boxed{\sqrt{10}}$

*~lmpofu*
## Video Solution 1 (HOW TO THINK CREATIVELY!!!)
https://youtu.be/_YDTIEuXTzY

*~Education, the Study of Everything*
## Video Solution 2 (Smart and Fun!!!)
https://youtu.be/7yAh4MtJ8a8?si=OJHbJh4_xMjBc9OY&t=1397

*~Math-X*
## See Also
