# 2006 AMC 12A Problem 21

## Problem
Let
$$S_1=\{(x,y)|\log_{10}(1+x^2+y^2)\le 1+\log_{10}(x+y)\}$$
and
$$S_2=\{(x,y)|\log_{10}(2+x^2+y^2)\le 2+\log_{10}(x+y)\}.$$

What is the ratio of the area of $S_2$ to the area of $S_1$?


$$\mathrm{(A) \ } 98\qquad \mathrm{(B) \ } 99\qquad \mathrm{(C) \ } 100\qquad \mathrm{(D) \ } 101\qquad \mathrm{(E) \ } 102$$

## Solution
Looking at the constraints of $S_1$:

 x+y > 0

$$\log_{10}(1+x^2+y^2)\le 1+\log_{10}(x+y)$$

$$\log_{10}(1+x^2+y^2)\le \log_{10} 10 +\log_{10}(x+y)$$

$$\log_{10}(1+x^2+y^2)\le \log_{10}(10x+10y)$$

$$1+x^2+y^2 \le 10x+10y$$

$$x^2-10x+y^2-10y \le -1$$

$$x^2-10x+25+y^2-10y+25 \le 49$$

$$(x-5)^2 + (y-5)^2 \le (7)^2$$

$S_1$ is a circle with a radius of 7. So, the area of $S_1$ is $49\pi$ .

Looking at the constraints of $S_2$:

 x+y > 0

$$\log_{10}(2+x^2+y^2)\le 2+\log_{10}(x+y)$$

$$\log_{10}(2+x^2+y^2)\le \log_{10} 100 +\log_{10}(x+y)$$

$$\log_{10}(2+x^2+y^2)\le \log_{10}(100x+100y)$$

$$2+x^2+y^2 \le 100x+100y$$

$$x^2-100x+y^2-100y \le -2$$

$$x^2-100x+2500+y^2-100y+2500 \le 4998$$

$$(x-50)^2 + (y-50)^2 \le (7\sqrt{102})^2$$

$S_2$ is a circle with a radius of $7\sqrt{102}.$ So, the area of $S_2$ is $4998\pi$ .

So the desired ratio is  $\frac{4998\pi}{49\pi} = 102 \Rightarrow \boxed{E}$ .
## See also
