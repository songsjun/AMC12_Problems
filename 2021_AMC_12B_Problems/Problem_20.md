# 2021 AMC 12B Problem 20

## Problem
Let Q(z) and R(z) be the unique polynomials such $thatz^{2021}$$+1=(z^2+$$z+1$)Q(z)+R(z)and the degree of R is less than 2. What is R(z)?

$\textbf{(A) }{-}z \qquad \textbf{(B) }{-}1 \qquad \textbf{(C) }2021\qquad \textbf{(D) }z+1 \qquad \textbf{(E) }2z+1$
## Solution 1 (Difference of Cubes)
Let z=s be a root of $z^2+z+1$ so that $s^2+s+1=0$. It follows that ($s-1)\left(s^2+s+1\right)=s^3-1=0,$ from which $s^3=1,$ but $s\neq1.$

Note that

$$
\begin{align*} s^{2021}+1 &= s^{3\cdot673+2}+1 \\ &= (s^3)^{673}\cdot s^2+1 \\ &= s^2+1 \\ &= \left(s^2+s+1\right)-s \\ &= -s. \end{align*}
$$

Since $z^{2021}+1$=-z for each root z=s of $z^2+z+1$, the remainder when $z^{2021}+1$ is divided by $z^2+z+1$ is R(z)=$\boxed{\textbf{(A) }{-}z}.$

*~MRENTHUSIASM*
## Solution 2 (Finds Q(z) Using Patterns)
Note that the equation above is in the form of polynomial division, with $z^{2021}+1$ being the dividend, z^2+$z+1$ being the divisor, and Q(x) and R(x) being the quotient and remainder respectively. Since the degree of the dividend is 2021 and the degree of the divisor is 2, that means the degree of the quotient is $2021-2 = 2019$. Note that R(x) can't influence the degree of the right hand side of this equation since its degree is either 1 or 0. Since the coefficients of the leading term in the dividend and the divisor are both 1, that means the coefficient of the leading term of the quotient is also 1. Thus, the leading term of the quotient is $z^{2019}$. Multiplying $z^{2019}$ by the divisor gives $z^{2021}+z^{2020}+z^{2019}$. We have our $z^{2021}$ term but we have these unnecessary terms like $z^{2020}$. We can get rid of these terms by adding -$z^{2018}$ to the quotient to cancel out these terms, but this then gives us $z^{2021}-z^{2018}$. Our first instinct will probably be to add $z^{2017}$, but we can't do this as although this will eliminate the -$z^{2018}$ term, it will produce a $z^{2019}$ term. Since no other term of the form $z^n$ where n is an integer less than 2017 will produce a $z^{2019}$ term when multiplied by the divisor, we can't add $z^{2017}$ to the quotient. Instead, we can add $z^{2016}$ to the coefficient to get rid of the -$z^{2018}$ term. Continuing this pattern, we get the quotient as $z^{2019}-z^{2018}+z^{2016}-z^{2015}+\cdots-z^2+1.$
The last term when multiplied with the divisor gives $z^2+z+1$. This will get rid of the $-z^2$ term but will produce the expression $z+1$, giving us the dividend as $z^{2021}+z+1$. Note that the dividend we want is of the form $z^{2021}+1$. Therefore, our remainder will have to be -z in order to get rid of the z term in the expression and give us $z^{2021}+1$, which is what we want. Therefore, the remainder is $\boxed{\textbf{(A) }{-}z}.$

*~rohan.sp ~rocketsri*
## Solution 3 (Modular Arithmetic in Polynomials)
Note that
$$z^3-1\equiv 0\pmod{z^2+z+1}$$
so if F(z) is the remainder when dividing by $z^3-1,$
$$F(z)\equiv R(z)\pmod{z^2+z+1}.$$
Now,
$$z^{2021}+1= (z^3-1)(z^{2018} + z^{2015} + \cdots + z^2) + z^2+1$$
So $F(z) = z^2+1$, and
$$R(z)\equiv F(z) \equiv -z\pmod{z^2+z+1}$$
The answer is $\boxed{\textbf{(A) }{-}z}.$
## Solution 4 (Complex Numbers)
One thing to note is that R(z) takes the form of Az + B for some constants A and B.
Note that the roots of $z^2 + z + 1$ are part of the solutions of $z^3 -1 = 0$.
They can be easily solved with roots of unity:

$$
\begin{align*} z^3 &= 1 \\ z^3 &= e^{i 0} \\ z &= e^{i 0}, e^{i \frac{2\pi}{3}}, e^{i\left(-\frac{2\pi}{3}\right)}. \end{align*}
$$

Obviously the right two solutions are the roots of $z^2 + z + 1 = 0.$
We substitute $e^{i \frac{2\pi}{3}}$ into the original equation, and $z^2 + z + 1$ becomes 0. Using De Moivre's Theorem, we get

$$
\begin{align*} e^{i\frac{4042\pi}{3}} + 1 &= A \cdot e^{i \frac{2\pi}{3}} + B \\ e^{i\frac{4\pi}{3}} + 1 &= A \cdot e^{i \frac{2\pi}{3}} + B. \end{align*}
$$

Expanding into rectangular complex number form:

$$\frac{1}{2} - \frac{\sqrt{3}}{2} i = \left(-\frac{1}{2}A + B\right) + \frac{\sqrt{3}}{2} A i.$$

Comparing the real and imaginary parts, we get (A,B) = (-1,0). So, the answer is $\boxed{\textbf{(A) }{-}z}.$

*~Jamess2022 (burntTacos ;-))*
## Solution 5 (Complex Numbers but Easier)
We have motivation to get rid of the Q(z) term by subtituting in either $e^{\frac{2\pi i}{3}}$ or $e^{\frac{4\pi i}{3}}$ for z, as this sets $z^2+z+1$ equal to 0. Doing so,

$$
\begin{align*} \left(e^{\frac{2\pi i}{3}}\right)^{2021} + 1 &= R\left(e^{\frac{2\pi i}{3}}\right) \\ e^{\frac{4042\pi i}{3}} + 1 &= R\left(e^{\frac{2\pi i}{3}}\right) \\ e^{\frac{4\pi i}{3}} + 1 &= R\left(e^{\frac{2\pi i}{3}}\right) \\ \frac{1}{2}-\frac{\sqrt{3}}{2}i &= R\left(-\frac{1}{2} + \frac{\sqrt{3}}{2} i \right). \end{align*}
$$

This immediately eliminates choices $\textbf{(B)}$ and $\textbf{(C)},$ as they are constants. Upon a quick check, $R(z) = 2z+1$ and z + 1 both don't work, as the sign of $\frac{\sqrt{3}}{2}$ has to be negative. Checking R(z) (or realizing that it's the only one that actually works), we see that $\boxed{\textbf{(A) }{-}z}$ is the right answer.

*~Benedict T (countmath1)*
## Solution 6 (More Complex Numbers)
Since $z^{2021}+1=(z^2+z+1$)Q(z)+R(z), we can plug in either $\text{cis} (240^{\circ})$ or $\text{cis} (240^{\circ}).$ Assuming $R(z)=ax+b$, we have a($\text{cis}(240^{\circ}))+b=\frac{1}{2}+\frac{i\sqrt{3}}{2}$ and a($\text{cis}(120^{\circ}))+b=\frac{1}{2}-\frac{i\sqrt{3}}{2}.$ Solving gives us a=-1 and $b=0$, thus R(z)=$\boxed{\textbf{(A) }{-}z}.$

*~SirAppel*
## Solution 7 (Factorization)
Notice that ($z^{2018}+z^{2015}+z^{2012}+\cdots +z^5 + z^2)(z^2 + z + 1) =z^{2020}+z^{2019}+\cdots +z^{4}+ z^3 + z^2,$ so

$$
\begin{align*} z^{2021} + 1 = z^{2021} - 1 + 2 &= (z-1)( z^{2020} + z^{2019} + \cdots + z^{2} + z + 1 ) + 2 \\ &= (z-1)[(z^{2018} + z^{2015} + z^{2012} + \cdots + z^5 + z^2)(z^2 + z + 1) + z + 1] + 2 \\ &= (z-1)(z^{2018} + z^{2015} + z^{2012} + \cdots + z^5 + z^2)(z^2 + z + 1) + (z-1)(z+1) + 2 \\ &= (z-1)(z^{2018} + z^{2015} + z^{2012} + \cdots + z^5 + z^2)(z^2 + z + 1) + z^2 + 1 \\ &= (z-1)(z^{2018} + z^{2015} + z^{2012} + \cdots + z^5 + z^2)(z^2 + z + 1) + z^2 + z + 1 - z \\ &= (z^2 + z + 1)[(z^{2018} + z^{2015} + z^{2012} + \cdots + z^5 + z^2)(z-1) + 1] - z. \end{align*}
$$

Therefore, we have $Q(z) = (z^{2018}+z^{2015}+z^{2012}+\cdots +z^5 + z^2)(z-1)$$$ + 1, from which R(z) = $\boxed{\textbf{(A) }{-}z}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 8
Let P(z)=$z^{2021}+1$ and r be a root of $z^2+z+1$, then note that


$$
\begin{align*} &r^{3k} = 1 \\ &r^{3k+1} = r \\ &r^{3k+2} = -r-1 \\ \end{align*}
$$


for all non-negative integers k. Since
$$P(r)=(r^2+r+1)Q(r)+R(r)=R(r)$$
and P(r)=$r^{2021}+$1=(-r - 1)+1=-r, $R(r)=-r.$ Therefore, $\boxed{\textbf{(A) }{-}z}$ is the only feasible option.

~[https://artofproblemsolving.com/wiki/index.php/User:Bloggish Bloggish]
## Video Solution
https://youtu.be/3GYJE9aK83k

*~MathProblemSolvingSkills.com*
## Video Solution by OmegaLearn (Using Modular Arithmetic and Meta-Solving)
https://youtu.be/nnjr17q7fS0

*~pi_is_3.14*
## Video Solution (Long Division, Not Brutal)
https://youtu.be/kxPDeQRGLEg

*~hippopotamus1*
## See Also
