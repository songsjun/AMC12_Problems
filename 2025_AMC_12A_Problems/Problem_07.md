# 2025 AMC 12A Problem 7

## Problem
In a certain alien world, the maximum running speed $v$ of an organism is dependent on its number of toes $n$ and number of eyes $m$. The relationship can be expressed as $v=kn^am^b$ centimeters per hour, where $k$, $a$, and $b$ are integer constants. In a population where all organisms have 5 toes, $\log v=4+2\log m$; and in a population where all organisms have 25 eyes, $\log v=4+4\log n$, where all logs are in base 10. What is $k+a+b$?

$\textbf{(A) } 20 \qquad \textbf{(B) } 21 \qquad \textbf{(C) } 22 \qquad \textbf{(D) } 23 \qquad \textbf{(E) } 24$
## Solution 1 (logs and system of equations)
Substitute $v=kn^am^b$ into the equation for the population with $n=5$:

$$
\log(k\cdot5^a m^b)=4+2\log m=\log(10^4m^2).
$$

For the population with $m=25$, the same substitution gives

$$
\log(kn^a\cdot25^b)=4+4\log n=\log(10^4n^4).
$$

Because the logarithm is one-to-one, these become

$$
\begin{aligned}
k\cdot5^a m^b&=10^4m^2,\\
kn^a\cdot25^b&=10^4n^4.
\end{aligned}
$$

Since these identities hold for every positive $m$ and $n$, comparison of exponents gives $b=2$ and $a=4$. Substituting $a=4$ into the first identity yields

$$
k\cdot5^4=10^4=2^4\cdot5^4,
$$

so $k=16$. Therefore

$$
k+a+b=16+4+2=\boxed{\textbf{(C) }22}.
$$

*~Cyrus825 ~ScoutViolet (mostly minor fixes) ~knight10 (minor fixes)*
## Solution 2
We first try to simplify both log equations, and then we bring in the equation for velocity.

For the equation representing organisms with 5 toes:

$$\log v = 4 + 2 \log m$$

$$\log v = \log 10^4 + \log m^2$$

$$\log v = \log(10^4\cdot m^2)$$

$$v = 10^4\cdot m^2$$

$$k\cdot 5^am^b = 10^4\cdot m^2$$

We do the same with the logarithm equation representing organisms with 25 eyes to get:

$$\log v = 4 + 4 \log n$$

$$v = 10^4\cdot n^4$$

$$k\cdot n^a(25^b) = 10^4\cdot n^4$$

Now we need to figure out what a, b, and k are. Looking at the first equation (or the second), we notice that we can easily match factors. There are two ms on the right side so we set $b = 2$ so there are two ms on the left side. Now we need $10^4 =k\cdot 5^a = 5^4\cdot 2^4.$ There are four $5s$ on one side, so we need $a = 4$ to get four $5s$ on the other. Now, $k = 2^4 = 16$. This solution works for the first equation.

Checking if these values work with the second equation, it does, so our answer is 2 + 4 + 16 = $\boxed{22}$

*~Logibyte*
## Video Solution (Quick and Intuitive!)
https://youtu.be/TakQew-TlUs

*~Education, the Study of Everything*
## Video Solution by Power Solve
https://youtu.be/Vd_kvodRjNQ?si=V7ea9tJxYVGf9Uz7&t=420
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=dAeyV60Hu5c
