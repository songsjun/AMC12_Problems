# 2016 AMC 12A Problem 22

## Problem
How many ordered triples $(x,y,z)$ of positive integers satisfy $\text{lcm}(x,y) = 72, \text{lcm}(x,z) = 600,$ and $\text{lcm}(y,z)=900$?

$\textbf{(A)}\ 15\qquad\textbf{(B)}\ 16\qquad\textbf{(C)}\ 24\qquad\textbf{(D)}\ 27\qquad\textbf{(E)}\ 64$
## Solution 1
We prime factorize $72,600,$ and $900$. The prime factorizations are $\times 3^2,\times 3\times 5^2$ and $\times 3^2\times 5^2$, respectively. Let $x=2^a\times 3^b\times 5^c$, $y=2^d\times 3^e\times 5^f$ and $z=2^g\times 3^h\times 5^i$. We know that

$$\max(a,d)=3$$



$$\max(b,e)=2$$



$$\max(a,g)=3$$



$$\max(b,h)=1$$



$$\max(c,i)=2$$



$$\max(d,g)=2$$



$$\max(e,h)=2$$

 and $c=f=0$ since $\text{lcm}(x,y)$ isn't a multiple of 5. Since $\max(d,g)=2$ we know that $a=3$. We also know that since $\max(b,h)=1$ that $e=2$. So now some equations have become useless to us...let's take them out.

$$\max(b,h)=1$$



$$\max(d,g)=2$$

 are the only two important ones left. We do casework on each now. If $\max(b,h)=1$ then $(b,h)=(1,0),(0,1)$ or $(1,1)$. Similarly if $\max(d,g)=2$ then $(d,g)=(2,0),(2,1),(2,2),(1,2),(0,2)$. Thus our answer is $\times 3=\boxed{\textbf{(A) }15}.$
## Solution 2
It is well known that if the $\text{lcm}(a,b)=c$ and $c$ can be written as $p_1^ap_2^bp_\dots$, then the highest power of all prime numbers $p_1,p_2,p_\dots$ must divide into either $a$ and/or $b$. Or else a lower $c_0=p_1^{a\epsilon}p_2^{b\epsilon}p_3^{c\epsilon}\dots$ is the $\text{lcm}$.

Start from $x$:$\text{lcm}(x,y)=72$ so $8\mid x$ or $9\mid x$ or both. But $9\nmid x$ because $\text{lcm}(x,z)=600$ and $9\nmid 600$.
So $x=8,24$.

$y$ can be $9,18,36$ in both cases of $x$ but NOT $72$ because $\text{lcm}(y,z)=900$ and $72\nmid 900$.

So there are six sets of $x,y$ and we will list all possible values of $z$ based on those.

$25\mid z$ because $z$ must source all powers of $5$. $z\in\{25,50,75,100,150,300\}$. $z\ne\{200,225\}$ because of $\text{lcm}$ restrictions.

By different sourcing of powers of $2$ and $3$,


$$(8,9):z=300$$


$$(8,18):z=300$$


$$(8,36):z=75,150,300$$


$$(24,9):z=100,300$$


$$(24,18):z=100,300$$


$$(24,36):z=25,50,75,100,150,300$$


$z=100$ is "enabled" by $x$ sourcing the power of $3$. $z=75,150$ is uncovered by $y$ sourcing all powers of $2$. And $z=25,50$ is uncovered by $x$ and $y$ both at full power capacity.

Counting the cases, $\boxed{\textbf{(A) }15}.$
## Solution 3 (Less Casework!)
As said in previous solutions, start by factoring $72, 600,$ and $900$. The prime factorizations are as follows:

$$72=2^3\cdot 3^2,$$



$$600=2^3\cdot 3\cdot 5^2,$$



$$\text{and } 900=2^2\cdot 3^2\cdot 5^2$$


To organize $x,y, \text{ and } z$ and their respective LCMs in a simpler way, we can draw a triangle as follows such that $x,y, \text{and } z$ are the vertices and the LCMs are on the edges.

<asy>
//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(0.45);
size(200pt);
fontsize(15pt);
pair X, Y, Z;
real R;
path tri;
```


//Variable Definitions
R = 1;
X = R*dir(90);
Y = R*dir(210);
Z = R*dir(-30);
tri = X--Y--Z--cycle;

//Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(tri);
label("$x$",X,N);
label("$y$",Y,SW);
label("$z$",Z,SE);
label("$2^33^25^0$",X--Y,2W);
label("$2^33^15^2$",X--Z,2E);
label("$2^23^25^2$",Y--Z,2S);
```

</asy>

Now we can split this triangle into three separate ones for each of the three different prime factors $2,3, \text{and } 5$.

<asy>
//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(0.45);
size(200pt);
fontsize(15pt);
pair X, Y, Z;
real R;
path tri;
```


//Variable Definitions
R = 1;
X = R*dir(90);
Y = R*dir(210);
Z = R*dir(-30);
tri = X--Y--Z--cycle;

//Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(tri);
label("$x$",X,N);
label("$y$",Y,SW);
label("$z$",Z,SE);
label("$2^3$",X--Y,2W);
label("$2^3$",X--Z,2E);
label("$2^2$",Y--Z,2S);
```

</asy>

Analyzing for powers of $2$, it is quite obvious that $x$ must have $2^3$ as one of its factors since neither $y \text{ nor } z$ can have a power of $2$ exceeding $2$. Turning towards the vertices $y$ and $z$, we know at least one of them must have $2^2$ as its factors. Therefore, we have $5$ ways for the powers of $2$ for $y \text{ and } z$ since the only ones that satisfy the previous conditions are for ordered pairs $(y,z) \{(2,0)(2,1)(0,2)(1,2)(2,2)\}$.

<asy>
//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(0.45);
size(200pt);
fontsize(15pt);
pair X, Y, Z;
real R;
path tri;
```


//Variable Definitions
R = 1;
X = R*dir(90);
Y = R*dir(210);
Z = R*dir(-30);
tri = X--Y--Z--cycle;

//Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(tri);
label("$x$",X,N);
label("$y$",Y,SW);
label("$z$",Z,SE);
label("$3^2$",X--Y,2W);
label("$3^1$",X--Z,2E);
label("$3^2$",Y--Z,2S);
```

</asy>

Using the same logic as we did for powers of $2$, it becomes quite easy to note that $y$ must have $3^2$ as one of its factors. Moving onto $x \text{ and } z$, we can use the same logic to find the only ordered pairs $(x,z)$ that will work are $\{(1,0)(0,1)(1,1)\}$.

The final and last case is the powers of $5$.

<asy>
//Variable Declarations

> [Asymptote diagram - not rendered in Markdown]

```asy
defaultpen(0.45);
size(200pt);
fontsize(15pt);
pair X, Y, Z;
real R;
path tri;
```


//Variable Definitions
R = 1;
X = R*dir(90);
Y = R*dir(210);
Z = R*dir(-30);
tri = X--Y--Z--cycle;

//Diagram

> [Asymptote diagram - not rendered in Markdown]

```asy
draw(tri);
label("$x$",X,N);
label("$y$",Y,SW);
label("$z$",Z,SE);
label("$5^0$",X--Y,2W);
label("$5^2$",X--Z,2E);
label("$5^2$",Y--Z,2S);
```

</asy>

This is actually quite a simple case since we know $z$ must have $5^2$ as part of its factorization while $x \text{ and } y$ cannot have a factor of $5$ in their prime factorization.

Multiplying all the possible arrangements for prime factors $2,3, \text{ and } 5$, we get the answer:


$$5\cdot3\cdot1=\boxed{\textbf{(A) }15}$$


(Diagrams by ColtsFan10)
## Solution 4
The least common multiples with $x$ in it are $\text{lcm}(x,y)$ and $\text{lcm}(x,z)$. Since $\text{lcm}(y,z)$ is without a multiple of $8$, and $\text{lcm}(x,y)$ and $\text{lcm}(x,z)$ are, we know $x$ must be some constant, let's say, $k$, so $x = \times k$. Doing the same for $y$ and $z$, where you are trying to find the multiples that they are not in vs. what they are in. For $y$ you will see that it's lowest is $9$, and for $z$ it's $2$5. Now in $\text{lcm}$, the $\text{lcm}$ of $2$ and $3$ and $2$ and $6$ are the same because the $6$ can be simplified to $3$ since both numbers share a factor of $2$ and therefore one can lose it so you don't accidentally overshoot your $\text{lcm}$. For example, $x$ can also be $24(\times 8)$, because when you do $\text{lcm}(x,y)$ a factor of $3$ from $24$ and the $3$ from $9$(assuming that it is $9$, but in any other case where it isn't it should still be ending up with $\text{lcm}(x,y) = 72$) match up, and so one factor of $3$ is removed, and it's now going to give you an output of $72$. Doing so you find that $x$ can be $8$ and $2$4, $y$ can be $9,18$ and $3$6, $z$ can be $25,50,75,100,150$ or $300$. Now you can choose a value from these lists to be put in $(x,y,z)$. However if you choose say $x = 8$ and $z = 25$ the least common multiple is $200$, not $600$. for this kind of case you may need to force a number to have a certain other multiple to be able to reach the desired $\text{lcm}$. If you do casework on $x$, since it has only $8$ and $24$, you'll find that there are $\boxed{\textbf{(A) }15}$ solutions
## Video Solution by AoPS Deven Ware
https://youtu.be/ja1KZ8tVwI8?si=hXhWIWnbUH9Llync
## See Also
